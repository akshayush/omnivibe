export const SAMPLE_DATASETS = [
  {
    id: "orders",
    label: "E-commerce orders",
    description: "Messy order export with nulls, duplicates, and a pricing outlier.",
    filename: "orders_sample.csv",
    csv: `order_id,customer_email,amount,currency,status,ordered_on,channel,discount_code
1001,ada@example.com,49.90,USD,paid,2026-07-01,web,
1002,grace@example.com,128.00,USD,paid,2026-07-01,web,SUMMER10
1003,alan@example.com,,USD,pending,2026-07-02,mobile,
1004,katherine@example.com,76.50,USD,paid,2026-07-02,web,
1005,ada@example.com,49.90,USD,refunded,2026-07-03,web,
1006,linus@example.com,18999.00,USD,paid,2026-07-03,partner,VIP
1007,barbara@example.com,64.25,USD,paid,2026-07-04,mobile,
1008,,32.10,USD,paid,2026-07-04,web,
1009,margaret@example.com,88.00,USD,failed,2026-07-05,web,SUMMER10
1010,edsger@example.com,54.75,USD,paid,2026-07-05,mobile,
1011,ada@example.com,49.90,USD,paid,2026-07-06,web,
1012,john@example.com,,USD,pending,2026-07-06,partner,
1013,alonzo@example.com,112.40,USD,paid,2026-07-07,web,
1014,claude@example.com,27.99,USD,paid,2026-07-07,mobile,
1015,ada@example.com,49.90,USD,paid,2026-07-06,web,
1016,donald@example.com,203.15,USD,paid,2026-07-08,web,LOYAL5
1017,frances@example.com,,USD,pending,2026-07-08,mobile,
1018,tim@example.com,41.60,USD,paid,2026-07-09,web,
1019,vint@example.com,95.00,USD,paid,2026-07-09,partner,
1020,radia@example.com,73.30,USD,refunded,2026-07-10,web,`,
  },
  {
    id: "tickets",
    label: "Support tickets",
    description: "Ticket log with inconsistent priorities and long resolution tails.",
    filename: "support_tickets_sample.csv",
    csv: `ticket_id,opened_on,priority,queue,resolution_hours,reopened,csat
T-501,2026-06-01,high,billing,4.5,no,4
T-502,2026-06-01,low,onboarding,26.0,no,5
T-503,2026-06-02,HIGH,billing,3.2,yes,2
T-504,2026-06-02,medium,platform,11.75,no,4
T-505,2026-06-03,low,onboarding,31.5,no,
T-506,2026-06-03,high,platform,2.1,no,5
T-507,2026-06-04,medium,billing,,no,3
T-508,2026-06-04,low,onboarding,44.0,yes,2
T-509,2026-06-05,high,platform,1.75,no,5
T-510,2026-06-05,medium,billing,9.5,no,4
T-511,2026-06-06,low,onboarding,412.0,yes,1
T-512,2026-06-06,high,platform,3.9,no,5
T-513,2026-06-07,medium,billing,14.25,no,3
T-514,2026-06-07,low,onboarding,22.5,no,4
T-515,2026-06-08,high,billing,2.4,no,5
T-516,2026-06-08,medium,platform,,no,
T-517,2026-06-09,low,onboarding,35.75,no,3
T-518,2026-06-09,high,platform,5.1,yes,2
T-519,2026-06-10,medium,billing,12.0,no,4
T-520,2026-06-10,low,onboarding,28.25,no,4`,
  },
  {
    id: "sensors",
    label: "IoT sensor readings",
    description: "Time-series readings with dropouts and a stuck sensor channel.",
    filename: "sensor_readings_sample.csv",
    csv: `reading_id,device_id,recorded_on,temperature_c,humidity_pct,battery_pct,firmware
R-1,dev-01,2026-05-01,21.4,44.2,98,2.1.0
R-2,dev-02,2026-05-01,22.1,45.9,97,2.1.0
R-3,dev-03,2026-05-01,20.8,43.1,12,2.1.0
R-4,dev-01,2026-05-02,21.9,44.8,97,2.1.0
R-5,dev-02,2026-05-02,,46.2,96,2.1.0
R-6,dev-03,2026-05-02,20.9,43.4,9,2.1.0
R-7,dev-01,2026-05-03,22.3,45.1,96,2.1.0
R-8,dev-02,2026-05-03,21.7,46.0,95,2.1.0
R-9,dev-03,2026-05-03,-40.0,43.2,6,2.1.0
R-10,dev-01,2026-05-04,22.0,44.6,95,2.1.0
R-11,dev-02,2026-05-04,21.5,,94,2.1.0
R-12,dev-03,2026-05-04,20.7,43.0,4,2.1.0
R-13,dev-01,2026-05-05,21.8,44.9,94,2.1.0
R-14,dev-02,2026-05-05,22.4,46.5,93,2.1.0
R-15,dev-03,2026-05-05,20.6,43.3,2,2.1.0
R-16,dev-01,2026-05-06,21.6,45.0,93,2.1.0
R-17,dev-02,2026-05-06,22.2,46.1,92,2.1.0
R-18,dev-03,2026-05-06,20.5,43.5,1,2.1.0`,
  },
];
