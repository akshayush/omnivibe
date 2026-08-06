"""Dataset profiling used by the public capability demo.

Runs on stdlib only: uploads are parsed in memory, profiled, and discarded.
"""

from __future__ import annotations

import csv
import io
import math
import re
from collections import Counter
from dataclasses import dataclass, field
from datetime import date, datetime

MAX_UPLOAD_BYTES = 2_000_000
MAX_ROWS = 20_000
MAX_COLUMNS = 60

NULL_TOKENS = {"", "na", "n/a", "null", "none", "nan", "-", "--", "nil", "unknown"}
DATE_FORMATS = ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%Y/%m/%d", "%d-%m-%Y", "%Y-%m-%dT%H:%M:%S")
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class ProfileError(ValueError):
    """Raised when an upload cannot be profiled."""


@dataclass
class ColumnProfile:
    name: str
    inferred_type: str
    filled: int
    missing: int
    missing_pct: float
    unique: int
    sample_values: list[str]
    stats: dict[str, float] = field(default_factory=dict)
    top_values: list[dict[str, object]] = field(default_factory=list)
    outlier_count: int = 0
    issues: list[str] = field(default_factory=list)
    suggested_checks: list[str] = field(default_factory=list)

    def as_dict(self) -> dict[str, object]:
        return {
            "name": self.name,
            "inferredType": self.inferred_type,
            "filled": self.filled,
            "missing": self.missing,
            "missingPct": self.missing_pct,
            "unique": self.unique,
            "sampleValues": self.sample_values,
            "stats": self.stats,
            "topValues": self.top_values,
            "outlierCount": self.outlier_count,
            "issues": self.issues,
            "suggestedChecks": self.suggested_checks,
        }


def _is_null(value: str) -> bool:
    return value.strip().lower() in NULL_TOKENS


def _parse_number(value: str) -> float | None:
    candidate = value.strip().replace(",", "")
    if candidate.endswith("%"):
        candidate = candidate[:-1]
    if candidate.startswith(("$", "£", "€")):
        candidate = candidate[1:]
    if not candidate or candidate in {"-", "+", "."}:
        return None
    try:
        parsed = float(candidate)
    except ValueError:
        return None
    return parsed if math.isfinite(parsed) else None


def _parse_date(value: str) -> date | None:
    candidate = value.strip()
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(candidate, fmt).date()
        except ValueError:
            continue
    return None


def _infer_type(values: list[str]) -> str:
    if not values:
        return "empty"

    numeric = sum(1 for value in values if _parse_number(value) is not None)
    if numeric / len(values) >= 0.9:
        integral = all(
            (parsed := _parse_number(value)) is not None and parsed.is_integer() for value in values
        )
        return "integer" if integral else "number"

    dated = sum(1 for value in values if _parse_date(value) is not None)
    if dated / len(values) >= 0.9:
        return "date"

    lowered = {value.strip().lower() for value in values}
    if lowered <= {"true", "false", "yes", "no", "0", "1", "y", "n"}:
        return "boolean"

    if sum(1 for value in values if EMAIL_PATTERN.match(value.strip())) / len(values) >= 0.9:
        return "email"

    return "text"


def _quantile(sorted_values: list[float], fraction: float) -> float:
    if not sorted_values:
        return 0.0
    position = (len(sorted_values) - 1) * fraction
    lower = math.floor(position)
    upper = math.ceil(position)
    if lower == upper:
        return sorted_values[int(position)]
    weight = position - lower
    return sorted_values[lower] * (1 - weight) + sorted_values[upper] * weight


def _round(value: float) -> float:
    return round(value, 4)


def _profile_numeric(values: list[float]) -> tuple[dict[str, float], int]:
    ordered = sorted(values)
    count = len(ordered)
    mean = sum(ordered) / count
    variance = sum((value - mean) ** 2 for value in ordered) / count
    q1 = _quantile(ordered, 0.25)
    q3 = _quantile(ordered, 0.75)
    iqr = q3 - q1
    lower_fence = q1 - 1.5 * iqr
    upper_fence = q3 + 1.5 * iqr
    outliers = sum(1 for value in ordered if value < lower_fence or value > upper_fence)

    stats = {
        "min": _round(ordered[0]),
        "max": _round(ordered[-1]),
        "mean": _round(mean),
        "median": _round(_quantile(ordered, 0.5)),
        "stdDev": _round(math.sqrt(variance)),
        "q1": _round(q1),
        "q3": _round(q3),
    }
    return stats, outliers


def _column_checks(profile: ColumnProfile, row_count: int) -> None:
    if profile.missing == 0 and row_count:
        profile.suggested_checks.append(f"`{profile.name}` is never null → enforce NOT NULL")
    elif profile.missing_pct >= 20:
        profile.issues.append(f"{profile.missing_pct:.0f}% of values are missing")
        profile.suggested_checks.append(f"Alert if `{profile.name}` null rate exceeds {min(profile.missing_pct + 5, 99):.0f}%")

    if profile.filled and profile.unique == profile.filled and profile.filled > 1:
        profile.suggested_checks.append(f"`{profile.name}` looks like a key → enforce UNIQUE")

    if profile.filled and profile.unique == 1:
        profile.issues.append("Only one distinct value — column may be dead weight")

    if profile.outlier_count:
        share = profile.outlier_count / max(profile.filled, 1) * 100
        profile.issues.append(f"{profile.outlier_count} statistical outliers ({share:.1f}%)")
        profile.suggested_checks.append(f"Range check `{profile.name}` against expected bounds")

    if profile.inferred_type in {"integer", "number"} and profile.stats.get("min", 0) < 0:
        profile.suggested_checks.append(f"Confirm negative values are valid for `{profile.name}`")

    if profile.inferred_type == "date":
        profile.suggested_checks.append(f"Freshness check on `{profile.name}` (max date vs today)")


def _score(columns: list[ColumnProfile], row_count: int, duplicate_rows: int) -> int:
    if not columns or not row_count:
        return 0

    missing_penalty = sum(column.missing_pct for column in columns) / len(columns)
    outlier_penalty = sum(column.outlier_count for column in columns) / max(row_count, 1) * 100
    duplicate_penalty = duplicate_rows / row_count * 100
    constant_penalty = sum(6 for column in columns if column.filled and column.unique == 1)

    score = 100 - missing_penalty - min(outlier_penalty, 20) - min(duplicate_penalty * 2, 25) - constant_penalty
    return max(0, min(100, round(score)))


def profile_csv(raw: bytes, filename: str = "dataset.csv") -> dict[str, object]:
    """Profile a small CSV upload and return column stats plus suggested checks."""
    if not raw:
        raise ProfileError("The file is empty.")
    if len(raw) > MAX_UPLOAD_BYTES:
        raise ProfileError("File is larger than the 2 MB demo limit.")

    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError as error:
        raise ProfileError("File must be UTF-8 encoded CSV.") from error

    try:
        dialect = csv.Sniffer().sniff(text[:4096], delimiters=",;\t|")
        delimiter = dialect.delimiter
    except csv.Error:
        delimiter = ","

    reader = csv.reader(io.StringIO(text), delimiter=delimiter)
    try:
        header = next(reader)
    except StopIteration as error:
        raise ProfileError("The file has no header row.") from error

    header = [name.strip() or f"column_{index + 1}" for index, name in enumerate(header)]
    if len(header) > MAX_COLUMNS:
        raise ProfileError(f"Demo supports up to {MAX_COLUMNS} columns.")

    rows: list[list[str]] = []
    truncated = False
    ragged_rows = 0
    for row in reader:
        if len(rows) >= MAX_ROWS:
            truncated = True
            break
        if not any(cell.strip() for cell in row):
            continue
        if len(row) != len(header):
            ragged_rows += 1
            row = (row + [""] * len(header))[: len(header)]
        rows.append(row)

    if not rows:
        raise ProfileError("No data rows found under the header.")

    duplicate_rows = len(rows) - len({tuple(row) for row in rows})

    columns: list[ColumnProfile] = []
    for index, name in enumerate(header):
        raw_values = [row[index] for row in rows]
        present = [value for value in raw_values if not _is_null(value)]
        missing = len(raw_values) - len(present)
        missing_pct = missing / len(raw_values) * 100 if raw_values else 0.0
        inferred = _infer_type(present)

        profile = ColumnProfile(
            name=name,
            inferred_type=inferred,
            filled=len(present),
            missing=missing,
            missing_pct=round(missing_pct, 2),
            unique=len(set(present)),
            sample_values=present[:3],
        )

        if inferred in {"integer", "number"}:
            numbers = [parsed for value in present if (parsed := _parse_number(value)) is not None]
            if numbers:
                profile.stats, profile.outlier_count = _profile_numeric(numbers)
        elif inferred == "date":
            parsed_dates = [parsed for value in present if (parsed := _parse_date(value)) is not None]
            if parsed_dates:
                profile.top_values = [
                    {"value": min(parsed_dates).isoformat(), "count": 1, "label": "earliest"},
                    {"value": max(parsed_dates).isoformat(), "count": 1, "label": "latest"},
                ]
        else:
            counter = Counter(present)
            profile.top_values = [
                {"value": value, "count": count, "label": f"{count / len(present) * 100:.1f}%"}
                for value, count in counter.most_common(3)
            ] if present else []

        _column_checks(profile, len(rows))
        columns.append(profile)

    dataset_issues: list[str] = []
    if duplicate_rows:
        dataset_issues.append(f"{duplicate_rows} duplicate rows detected")
    if ragged_rows:
        dataset_issues.append(f"{ragged_rows} rows had a different column count than the header")
    if truncated:
        dataset_issues.append(f"Only the first {MAX_ROWS:,} rows were profiled in this demo")

    return {
        "filename": filename,
        "rowCount": len(rows),
        "columnCount": len(header),
        "duplicateRows": duplicate_rows,
        "qualityScore": _score(columns, len(rows), duplicate_rows),
        "datasetIssues": dataset_issues,
        "columns": [column.as_dict() for column in columns],
    }
