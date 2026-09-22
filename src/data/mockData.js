// Mock/local data for the PETROGEL Plant & QC Management Portal dashboard.
// Replace with real API calls once a backend is available.

export const dashboardStats = [
  {
    id: 'total-batches',
    label: 'Total Production Batches',
    value: 128,
    accent: 'blue',
  },
  {
    id: 'completed-batches',
    label: 'Completed Batches',
    value: 96,
    accent: 'blue',
  },
  {
    id: 'pending-qc',
    label: 'Pending QC Tests',
    value: 14,
    accent: 'orange',
  },
  {
    id: 'oor-alerts',
    label: 'OOR Alerts',
    value: 3,
    accent: 'orange',
    critical: true,
  },
  {
    id: 'awaiting-release',
    label: 'Batches Awaiting Release',
    value: 9,
    accent: 'blue',
  },
  {
    id: 'pending-tasks',
    label: 'Pending Tasks',
    value: 21,
    accent: 'orange',
  },
]

export const machines = [
  'Reactor R-1',
  'Reactor R-2',
  'Mixer M-3',
  'Filler Line F-1',
  'Blender B-2',
]

export const operators = [
  'A. Fernandes',
  'R. Gomes',
  'S. Kulkarni',
  'M. Pereira',
  'T. Shaikh',
]

export const productionInstructions = [
  {
    id: 'PB-2291',
    productName: 'Petrogel Lubricating Gel',
    variation: 'Standard Viscosity',
    quantity: '500 kg',
    productionDate: '2026-09-10',
    machine: 'Reactor R-1',
    operator: 'A. Fernandes',
    instructions: 'Heat base oil to 60°C, add thickener gradually while stirring at 200 RPM.',
    status: 'In QC',
  },
  {
    id: 'PB-2287',
    productName: 'Petrogel Industrial Grease',
    variation: 'High Temp Grade',
    quantity: '750 kg',
    productionDate: '2026-09-09',
    machine: 'Mixer M-3',
    operator: 'R. Gomes',
    instructions: 'Blend lithium soap with base oil at 90°C for 45 minutes before cooling.',
    status: 'In QC',
  },
  {
    id: 'PB-2280',
    productName: 'Petrogel Hydraulic Fluid',
    variation: 'Low Foam',
    quantity: '1000 L',
    productionDate: '2026-09-08',
    machine: 'Blender B-2',
    operator: 'S. Kulkarni',
    instructions: 'Mix base fluid with anti-foam additive at low shear for 20 minutes.',
    status: 'Released',
  },
  {
    id: 'PB-2276',
    productName: 'Petrogel Lubricating Gel',
    variation: 'Heavy Duty',
    quantity: '600 kg',
    productionDate: '2026-09-07',
    machine: 'Reactor R-2',
    operator: 'M. Pereira',
    instructions: 'Heat base oil to 65°C, add heavy-duty thickener in 3 stages.',
    status: 'Completed',
  },
  {
    id: 'PB-2265',
    productName: 'Petrogel Industrial Grease',
    variation: 'Marine Grade',
    quantity: '400 kg',
    productionDate: '2026-09-05',
    machine: 'Filler Line F-1',
    operator: 'T. Shaikh',
    instructions: 'Fill grease into 20kg pails after cooling to 40°C, seal and label.',
    status: 'Draft',
  },
]

export const auditChecklistTemplate = [
  {
    stage: 'Pre-Production Setup',
    items: [
      { id: 'sa-1', text: 'Work area and equipment cleaned and cleared of previous batch materials' },
      { id: 'sa-2', text: 'Batch documents and production instruction available at workstation' },
      { id: 'sa-3', text: 'Required raw materials verified against batch requirements' },
    ],
  },
  {
    stage: 'Machine Calibration',
    items: [
      { id: 'sa-4', text: 'Machine/reactor calibration status valid and within due date' },
      { id: 'sa-5', text: 'Temperature and pressure gauges verified against standard' },
      { id: 'sa-6', text: 'Mixer/stirrer speed settings match process instruction' },
    ],
  },
  {
    stage: 'Material Verification',
    items: [
      { id: 'sa-7', text: 'Raw material batch numbers and expiry dates recorded' },
      { id: 'sa-8', text: 'Material quantities weighed and verified against instruction' },
    ],
  },
  {
    stage: 'Safety Check',
    items: [
      { id: 'sa-9', text: 'PPE available and worn by operators' },
      { id: 'sa-10', text: 'Fire extinguisher and emergency stop accessible and unobstructed' },
    ],
  },
]

export const setupAudits = [
  {
    batchId: 'PB-2287',
    productName: 'Petrogel Industrial Grease',
    auditor: 'R. Gomes',
    date: '2026-09-09',
    remarks: 'Minor deviation in mixer speed, corrected before start.',
    correctiveAction: 'Mixer speed reset to 180 RPM as per instruction.',
    ncCount: 1,
    status: 'Completed',
  },
  {
    batchId: 'PB-2280',
    productName: 'Petrogel Hydraulic Fluid',
    auditor: 'S. Kulkarni',
    date: '2026-09-08',
    remarks: 'All checkpoints passed without issue.',
    correctiveAction: '—',
    ncCount: 0,
    status: 'Completed',
  },
  {
    batchId: 'PB-2276',
    productName: 'Petrogel Lubricating Gel',
    auditor: 'M. Pereira',
    date: '2026-09-07',
    remarks: 'PPE compliance issue observed and corrected on the spot.',
    correctiveAction: 'Operator re-briefed on PPE requirement; gloves and goggles issued.',
    ncCount: 1,
    status: 'Completed',
  },
  {
    batchId: 'PB-2265',
    productName: 'Petrogel Industrial Grease',
    auditor: 'T. Shaikh',
    date: '2026-09-05',
    remarks: 'Audit started, pending final sign-off.',
    correctiveAction: '—',
    ncCount: 0,
    status: 'Draft',
  },
]

export const qcParameters = [
  { id: 'boiler-outlet-temperature', name: 'Boiler Outlet Temperature', unit: '°C', specLow: 70, specHigh: 88 },
  { id: 'distributor-temperature', name: 'Distributor Temperature', unit: '°C', specLow: 66, specHigh: 80 },
  { id: 'granulator-speed', name: 'Granulator Speed', unit: '', specLow: 7, specHigh: 11 },
  { id: 'material-temperature', name: 'Material Temperature', unit: '°C', specLow: 60, specHigh: 90 },
  { id: 'viscosity', name: 'Viscosity', unit: 'cSt', specLow: 150, specHigh: 200 },
  { id: 'ph', name: 'pH Value', unit: '', specLow: 6.5, specHigh: 7.5 },
  { id: 'density', name: 'Density', unit: 'g/cm³', specLow: 0.86, specHigh: 0.92 },
  { id: 'moisture', name: 'Moisture Content', unit: '%', specLow: 0, specHigh: 0.5 },
  { id: 'color', name: 'Color (ASTM)', unit: '', specLow: 0, specHigh: 2.5 },
  { id: 'flashpoint', name: 'Flash Point', unit: '°C', specLow: 200, specHigh: 260 },
  { id: 'dropping-point', name: 'Dropping Point', unit: '°C', specLow: 180, specHigh: 220 },
]

export const randomChecks = [
  {
    batchId: 'PB-2291',
    sampleNo: 'RC-1042',
    checkDateTime: '2026-09-10 14:20',
    stage: 'Boiler / Heating',
    parameter: 'Boiler Outlet Temperature',
    specification: '70 – 88 °C',
    actualValue: '84 °C',
    result: 'PASS',
    remarks: 'Stable outlet temperature during the check.',
    tester: 'S. Kulkarni',
    status: 'Completed',
  },
  {
    batchId: 'PB-2287',
    sampleNo: 'RC-1038',
    checkDateTime: '2026-09-09 11:05',
    stage: 'Granulation',
    parameter: 'Granulator Speed',
    specification: '7 – 11',
    actualValue: '12.6',
    result: 'OOR',
    remarks: 'Speed above set range; batch flagged for review.',
    tester: 'R. Gomes',
    status: 'Completed',
  },
  {
    batchId: 'PB-2280',
    sampleNo: 'RC-1031',
    checkDateTime: '2026-09-08 09:40',
    stage: 'Distribution',
    parameter: 'Distributor Temperature',
    specification: '66 – 80 °C',
    actualValue: '74 °C',
    result: 'PASS',
    remarks: 'No foaming observed during sampling.',
    tester: 'S. Kulkarni',
    status: 'Completed',
  },
  {
    batchId: 'PB-2276',
    sampleNo: 'RC-1024',
    checkDateTime: '2026-09-07 16:15',
    stage: 'Material Transfer',
    parameter: 'Material Temperature',
    specification: '60 – 90 °C',
    actualValue: '82 °C',
    result: 'PASS',
    remarks: 'Sample dried and re-checked, result confirmed.',
    tester: 'M. Pereira',
    status: 'Completed',
  },
  {
    batchId: 'PB-2265',
    sampleNo: 'RC-1017',
    checkDateTime: '2026-09-05 10:30',
    stage: 'Final Processing',
    parameter: 'Viscosity',
    specification: '150 – 200 cSt',
    actualValue: '',
    result: '—',
    remarks: 'Sampling in progress, awaiting lab result.',
    tester: 'T. Shaikh',
    status: 'Draft',
  },
]

export const pelletMachineParameters = [
  { id: 'pelletizer-speed', name: 'Pelletizer Speed', unit: 'RPM', specLow: 7, specHigh: 11 },
  { id: 'pelletizer-temperature', name: 'Pelletizer Temperature', unit: '°C', specLow: 68, specHigh: 82 },
  { id: 'cutter-speed', name: 'Cutter Speed', unit: 'RPM', specLow: 18, specHigh: 26 },
  { id: 'feed-rate', name: 'Feed Rate', unit: 'kg/hr', specLow: 80, specHigh: 120 },
  { id: 'motor-load', name: 'Motor Load', unit: '%', specLow: 35, specHigh: 70 },
  { id: 'cooling-temperature', name: 'Cooling Temperature', unit: '°C', specLow: 18, specHigh: 28 },
]

export const pelletMachineReadings = [
  {
    batchId: 'PB-2291', machine: 'Pelletizer P-1', parameter: 'Pelletizer Speed',
    specification: '7 – 11 RPM', actualValue: '9.2 RPM', result: 'PASS',
    operator: 'S. Kulkarni', checkDateTime: '2026-09-10 14:32', status: 'Completed',
  },
  {
    batchId: 'PB-2287', machine: 'Pelletizer P-2', parameter: 'Motor Load',
    specification: '35 – 70 %', actualValue: '76 %', result: 'OOR',
    operator: 'R. Gomes', checkDateTime: '2026-09-09 11:18', status: 'Completed',
  },
  {
    batchId: 'PB-2280', machine: 'Pelletizer P-1', parameter: 'Cooling Temperature',
    specification: '18 – 28 °C', actualValue: '23 °C', result: 'PASS',
    operator: 'S. Kulkarni', checkDateTime: '2026-09-08 09:52', status: 'Completed',
  },
  {
    batchId: 'PB-2276', machine: 'Pelletizer P-3', parameter: 'Feed Rate',
    specification: '80 – 120 kg/hr', actualValue: '', result: '—',
    operator: 'M. Pereira', checkDateTime: '2026-09-07 16:26', status: 'Draft',
  },
]

export const inProcessTestParameters = [
  { id: 'appearance', name: 'Appearance', type: 'qualitative', unit: '', options: ['Pass', 'Fail'] },
  { id: 'colour', name: 'Colour', type: 'qualitative', unit: '', options: ['Pass', 'Fail'] },
  { id: 'odour', name: 'Odour', type: 'qualitative', unit: '', options: ['Pass', 'Fail'] },
  { id: 'viscosity', name: 'Viscosity', type: 'numeric', unit: 'cSt', specLow: 150, specHigh: 200 },
  { id: 'penetration', name: 'Penetration', type: 'numeric', unit: '0.1 mm', specLow: 180, specHigh: 220 },
  { id: 'melting-point', name: 'Melting Point', type: 'numeric', unit: '°C', specLow: 45, specHigh: 65 },
  { id: 'density', name: 'Density', type: 'numeric', unit: 'g/cm³', specLow: 0.86, specHigh: 0.92 },
]

export const inProcessTests = [
  {
    batchId: 'PB-2291', sampleNo: 'IP-2041', parameter: 'Appearance',
    specification: 'Pass', actualValue: 'Pass', result: 'PASS',
    tester: 'S. Kulkarni', checkDateTime: '2026-09-10 15:10', status: 'Completed',
  },
  {
    batchId: 'PB-2287', sampleNo: 'IP-2036', parameter: 'Viscosity',
    specification: '150 – 200 cSt', actualValue: '214 cSt', result: 'OOR / FAIL',
    tester: 'R. Gomes', checkDateTime: '2026-09-09 11:42', status: 'Completed',
  },
  {
    batchId: 'PB-2280', sampleNo: 'IP-2029', parameter: 'Density',
    specification: '0.86 – 0.92 g/cm³', actualValue: '0.89 g/cm³', result: 'PASS',
    tester: 'S. Kulkarni', checkDateTime: '2026-09-08 10:05', status: 'Submitted for QC Review',
  },
  {
    batchId: 'PB-2276', sampleNo: 'IP-2022', parameter: 'Melting Point',
    specification: '45 – 65 °C', actualValue: '', result: '—',
    tester: 'M. Pereira', checkDateTime: '2026-09-07 16:40', status: 'Draft',
  },
]

export const finalTestReleases = [
  {
    batchId: 'PB-2291', productName: 'Petrogel Lubricating Gel', testsCompleted: '7 / 7',
    overallResult: 'READY FOR RELEASE', analyst: 'S. Kulkarni', releaseStatus: 'Released',
    checkDateTime: '2026-09-10 16:20',
  },
  {
    batchId: 'PB-2287', productName: 'Petrogel Industrial Grease', testsCompleted: '7 / 7',
    overallResult: 'HOLD / NOT RELEASED', analyst: 'R. Gomes', releaseStatus: 'On Hold',
    checkDateTime: '2026-09-09 12:05',
  },
  {
    batchId: 'PB-2280', productName: 'Petrogel Hydraulic Fluid', testsCompleted: '6 / 7',
    overallResult: 'HOLD / NOT RELEASED', analyst: 'S. Kulkarni', releaseStatus: 'Pending Review',
    checkDateTime: '2026-09-08 10:30',
  },
]

export const workflowHistory = [
  {
    batchId: 'PB-2291', stage: 'Final Test', person: 'S. Kulkarni', role: 'QC Analyst',
    action: 'Approved', checkDateTime: '2026-09-10 16:05', status: 'Completed',
  },
  {
    batchId: 'PB-2291', stage: 'Batch Release', person: 'A. Fernandes', role: 'Plant Manager',
    action: 'Released', checkDateTime: '2026-09-10 16:20', status: 'Completed',
  },
  {
    batchId: 'PB-2287', stage: 'Random Checks', person: 'R. Gomes', role: 'QC Analyst',
    action: 'OOR flagged', checkDateTime: '2026-09-09 11:18', status: 'On Hold',
  },
]

export const recentNotifications = [
  {
    id: 1,
    type: 'alert',
    message: 'OOR result flagged on Batch PB-2291 — Viscosity out of range.',
    time: '10 min ago',
  },
  {
    id: 2,
    type: 'info',
    message: 'Batch PB-2287 completed production and moved to QC queue.',
    time: '42 min ago',
  },
  {
    id: 3,
    type: 'success',
    message: 'Batch PB-2280 approved and released to warehouse.',
    time: '1 hr ago',
  },
  {
    id: 4,
    type: 'task',
    message: 'New task assigned: Calibrate viscometer in QC Lab 2.',
    time: '2 hr ago',
  },
  {
    id: 5,
    type: 'info',
    message: 'Batch PB-2276 QC testing started.',
    time: '3 hr ago',
  },
  {
    id: 6,
    type: 'alert',
    message: 'Pending QC test overdue for Batch PB-2265.',
    time: '5 hr ago',
  },
]
