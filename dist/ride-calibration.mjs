// Handlebar calibration checked and accepted by user on 2026-09-16; hoods accepted as calibrated at 400 mm, saddle measured for approximate initial settings on 2026-09-19.
// Replace each profile independently after following AGENTS.md. Units: mm, BB origin.
export const CALIBRATION_REVISION = 'messung-2026-09-19.1';
export const HARDWARE = Object.freeze({
  frame: 'Zwift Ride V1', trainer: 'Wahoo KICKR CORE 2',
  handlebar: 'Fouriers 320–440 mm', handlebarReach: 85, handlebarDrop: 125,
  hoods: 'SRAM Force D2 eTap AXS DB',
  seatpost: 'V1 Adjustable Saddle Clamp & Seatpost',
  saddle: 'Vermessener Sattel · Modell nicht angegeben', saddleAngle: null,
  widthMin: 320, widthMax: 440, referenceWidth: 400, crank: 170,
  // Geometry-mode approximation only; target rail-clamp reference is not measured.
  saddleContact: {x:0,y:52,angle:0,status:'estimated',note:'Nur Geometrie-Näherung: kein gemessener Bezug zur Zielrad-Schienenklemmmitte.'},
});
export const BAR_SCALES = Object.freeze({reachTravel:164,heightTravel:158.5,intervals:23});
// LEGACY, uncorrected measurements; not used by live profiles. Historical MEDIUM foot. bbFloor on XX/XA was assumed.
export const RAW_MEDIUM = Object.freeze([
  {pose:'A/A',u:0,v:0,bbFloor:264,barFloor:865,x:397,bbAssumed:false},
  {pose:'A/X',u:0,v:1,bbFloor:264,barFloor:1015,x:355,bbAssumed:false},
  {pose:'X/A',u:1,v:0,bbFloor:264,barFloor:875,x:560,bbAssumed:true},
  {pose:'X/X',u:1,v:1,bbFloor:264,barFloor:1026,x:520,bbAssumed:true},
]);
export function fitCorners(rows) {
  const p=(u,v)=>{const r=rows.find(r=>r.u===u&&r.v===v);if(!r)throw new Error('Vier unterschiedliche Eckpunkte erforderlich.');return {x:r.x,y:r.barFloor-r.bbFloor};};
  const a=p(0,0),b=p(1,0),c=p(0,1),d=p(1,1),origin={},reach={},height={};
  for(const k of ['x','y']) {
    reach[k]=((b[k]-a[k])+(d[k]-c[k]))/2;
    height[k]=((c[k]-a[k])+(d[k]-b[k]))/2;
    origin[k]=(a[k]+b[k]+c[k]+d[k])/4-(reach[k]+height[k])/2;
    if(!Number.isFinite(origin[k]))throw new Error('Ungültige Eckpunktmessung.');
  }
  return {origin,reach,height,reachRange:[0,1],heightRange:[0,1]};
}
export const MEASURED_MEDIUM_BAR = fitCorners(RAW_MEDIUM);
// New independent campaign: direct clamp-axis coordinates. No diameter correction.
export const BAR_MEASUREMENT = Object.freeze({horizontalReference:'axis',verticalReference:'axis',correction:0});
export function axisRows(rows) {
  if(rows.some(row=>row.reference!=='axis'))throw new Error('Diese Kalibrierung erfordert direkte Achsenmessungen.');
  return rows;
}
export const RAW_CORNERS = {
  "none": [
    {
      "pose": "A/A",
      "u": 0,
      "v": 0,
      "bbFloor": 257,
      "barFloor": 852.5,
      "x": 402,
      "reference": "axis"
    },
    {
      "pose": "A/X",
      "u": 0,
      "v": 1,
      "bbFloor": 257,
      "barFloor": 999.5,
      "x": 362,
      "reference": "axis"
    },
    {
      "pose": "X/A",
      "u": 1,
      "v": 0,
      "bbFloor": 257,
      "barFloor": 863,
      "x": 565,
      "reference": "axis"
    },
    {
      "pose": "X/X",
      "u": 1,
      "v": 1,
      "bbFloor": 257,
      "barFloor": 1008.5,
      "x": 525,
      "reference": "axis"
    }
  ],
  "small": [
    {
      "pose": "A/A",
      "u": 0,
      "v": 0,
      "bbFloor": 263,
      "barFloor": 863,
      "x": 394,
      "reference": "axis"
    },
    {
      "pose": "A/X",
      "u": 0,
      "v": 1,
      "bbFloor": 263,
      "barFloor": 1009,
      "x": 353,
      "reference": "axis"
    },
    {
      "pose": "X/A",
      "u": 1,
      "v": 0,
      "bbFloor": 263,
      "barFloor": 875,
      "x": 557,
      "reference": "axis"
    },
    {
      "pose": "X/X",
      "u": 1,
      "v": 1,
      "bbFloor": 263,
      "barFloor": 1020.5,
      "x": 516,
      "reference": "axis"
    }
  ],
  "medium": [
    {
      "pose": "A/A",
      "u": 0,
      "v": 0,
      "bbFloor": 268,
      "barFloor": 871,
      "x": 388,
      "reference": "axis"
    },
    {
      "pose": "A/X",
      "u": 0,
      "v": 1,
      "bbFloor": 268,
      "barFloor": 1017,
      "x": 345.5,
      "reference": "axis"
    },
    {
      "pose": "X/A",
      "u": 1,
      "v": 0,
      "bbFloor": 268,
      "barFloor": 885,
      "x": 550,
      "reference": "axis"
    },
    {
      "pose": "X/X",
      "u": 1,
      "v": 1,
      "bbFloor": 268,
      "barFloor": 1030.5,
      "x": 508.5,
      "reference": "axis"
    }
  ],
  "large": [
    {
      "pose": "A/A",
      "u": 0,
      "v": 0,
      "bbFloor": 275,
      "barFloor": 887,
      "x": 374.5,
      "reference": "axis"
    },
    {
      "pose": "A/X",
      "u": 0,
      "v": 1,
      "bbFloor": 275,
      "barFloor": 1033,
      "x": 328,
      "reference": "axis"
    },
    {
      "pose": "X/A",
      "u": 1,
      "v": 0,
      "bbFloor": 275,
      "barFloor": 904,
      "x": 536,
      "reference": "axis"
    },
    {
      "pose": "X/X",
      "u": 1,
      "v": 1,
      "bbFloor": 275,
      "barFloor": 1049.5,
      "x": 491,
      "reference": "axis"
    }
  ]
};
// Fresh paired clamp/hood measurements: no historical clamp values used.
export const RAW_HOODS = {
  "none": {
    "barFloor": 933.5,
    "barX": 469,
    "hoodFloor": 955,
    "hoodX": 593
  },
  "small": {
    "barFloor": 944.5,
    "barX": 460,
    "hoodFloor": 969,
    "hoodX": 583
  },
  "medium": {
    "barFloor": 953.5,
    "barX": 452,
    "hoodFloor": 978,
    "hoodX": 575
  },
  "large": {
    "barFloor": 971.5,
    "barX": 437,
    "hoodFloor": 998,
    "hoodX": 561
  }
};
function measuredHand(id) {
  const r=RAW_HOODS[id];
  return {status:'validated',offset:{x:r.hoodX-r.barX,y:r.hoodFloor-r.barFloor},
    validatedAt:'2026-09-16',acceptedBy:'user',additionalChecksWaived:true,
    referenceWidth:400,widthInvariant:false,measuredAt:'2026-09-16',
    measuredSide:'right',leftSymmetry:'user-confirmed-not-measured',
    rotationAcrossFeet:'unchanged',position:'M/M',
    measurementPhoto:'IMG_1098.jpeg',positionInvarianceChecked:false};
}
// Saddle campaign: screw-axis coordinates, not saddle surface. A=0, M=12, X=23.
export const RAW_SADDLE = {
  "none": {
    "bbFloor": 257,
    "axis": [
      [
        0,
        785,
        170
      ],
      [
        12,
        912,
        208
      ],
      [
        23,
        1033,
        244
      ]
    ],
    "clampBaseline": [
      912,
      208
    ],
    "clamps": [
      [
        0,
        912,
        208
      ],
      [
        20,
        913,
        188
      ],
      [
        40,
        914,
        170
      ],
      [
        60,
        917,
        149
      ]
    ]
  },
  "small": {
    "bbFloor": 264,
    "axis": [
      [
        0,
        787,
        176
      ],
      [
        12,
        915,
        216.5
      ],
      [
        23,
        1034.5,
        254
      ]
    ],
    "clampBaseline": [
      915,
      216.5
    ],
    "clamps": [
      [
        0,
        915,
        216.5
      ],
      [
        20,
        916.5,
        195
      ],
      [
        40,
        918,
        178
      ],
      [
        60,
        920,
        158
      ]
    ]
  },
  "medium": {
    "bbFloor": 266.5,
    "axis": [
      [
        0,
        790,
        182
      ],
      [
        12,
        917.5,
        223.5
      ],
      [
        23,
        1036,
        266
      ]
    ],
    "clampBaseline": [
      917.5,
      223.5
    ],
    "clamps": [
      [
        0,
        917.5,
        223.5
      ],
      [
        20,
        919,
        203.5
      ],
      [
        40,
        921,
        185
      ],
      [
        60,
        924,
        164
      ]
    ]
  },
  "large": {
    "bbFloor": 277,
    "axis": [
      [
        0,
        794,
        194
      ],
      [
        12,
        922,
        238
      ],
      [
        23,
        1040,
        278
      ]
    ],
    "clampBaseline": [
      921.5,
      238
    ],
    "clamps": [
      [
        0,
        921.5,
        238
      ],
      [
        20,
        923.5,
        216
      ],
      [
        40,
        925,
        198
      ],
      [
        60,
        923.5,
        180
      ]
    ]
  }
};
export const SADDLE_CONTACT = Object.freeze({
  screwFloor:918,surfaceFloor:970,verticalOffset:52,
  referenceFoot:'medium',referenceHeight:'M',referenceClamp:0,
  screwSetback:223.5,frontSetback:210,rearSetback:231.5,
  offset:{x:2.75,y:52},railRange:[-10.75,10.75],
  saddleModel:null,measuredAngle:null,status:'measured-approximation',
  note:'Horizontaler Schienenweg; Höhe entlang der Schienen und Winkelabhängigkeit nicht vermessen. Gemeinsamer Bezugspunkt wird vorausgesetzt.',
});
function measuredSaddle(id){
  const r=RAW_SADDLE[id],a=r.axis[0],m=r.axis[1],z=r.axis[2];
  const origin={x:-a[2],y:a[1]-r.bbFloor},height={x:a[2]-z[2],y:z[1]-a[1]};
  return {kind:'discrete-saddle',status:'measured-approximation',measuredAt:'2026-09-19',
    origin,height,heightRange:[0,1],scale:{first:'A',last:'X',intervals:23},
    control:{pose:'M',usedInFit:false,residual:{x:-m[2]-(origin.x+height.x*12/23),y:m[1]-r.bbFloor-(origin.y+height.y*12/23)}},
    mounts:r.clamps.map(([position,floor,setback])=>({position,offset:{x:r.clampBaseline[1]-setback,y:floor-r.clampBaseline[0]}})),
    contact:{...SADDLE_CONTACT.offset},rail:{x:1,y:0},railRange:[...SADDLE_CONTACT.railRange],
    angle:null,tiltSamples:[],referenceSaddle:HARDWARE.saddle,
    assumptions:['52-mm-Aufbau konstant','Schienenweg bei allen Klemmpositionen gleich','Sattelbezug aus mittlerem Fuß näherungsweise für alle Füße'],
  };
}
export const FOOT_PROFILES = [
  ['none','Ohne Fuß',null,0],
  ['small','Kleiner Fuß',17.5,-0.7],
  ['medium','Mittlerer Fuß',28,0],
  ['large','Großer Fuß',51,1.5],
].map(([id,label,footHeight,angle])=>({
  id,label,footHeight,revision:CALIBRATION_REVISION, status:'validated',
  note:'Lenker geprüft. Rechte Hood bei 400 mm gemessen; links laut Benutzer symmetrisch. Sattelmechanik gemessen; Sattelposition als Ausgangseinstellung angenähert.',
  handlebar:{...fitCorners(axisRows(RAW_CORNERS[id])),status:'validated'},
  hand:measuredHand(id),
  saddle:measuredSaddle(id),
  measuredAt:'2026-09-16', recordedAt:'2026-09-16', validatedAt:'2026-09-16',
  validation:{scope:'handlebar-axis',method:'independent-MM-control',acceptedBy:'user',
    repeatabilityTested:false,guaranteedTolerance:null,controlUsedInFit:false},
}));
