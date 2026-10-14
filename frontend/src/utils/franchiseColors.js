/**
 * frontend/src/utils/franchiseColors.js
 * Authoritative franchise color mapping for the IPL Big Data Analytics Platform.
 * Ensures 100% stable, consistent team colors across all charts, cards, tables, and badges.
 */

export const FRANCHISE_COLORS = {
  // 10 Active Franchises
  'Chennai Super Kings': {
    primary: '#FDB913',
    secondary: '#193A83',
    accent: '#FFE066',
    text: '#000000',
    code: 'CSK'
  },
  'CSK': {
    primary: '#FDB913',
    secondary: '#193A83',
    accent: '#FFE066',
    text: '#000000',
    code: 'CSK'
  },
  'Mumbai Indians': {
    primary: '#004BA0',
    secondary: '#D1AB3E',
    accent: '#4DABF7',
    text: '#FFFFFF',
    code: 'MI'
  },
  'MI': {
    primary: '#004BA0',
    secondary: '#D1AB3E',
    accent: '#4DABF7',
    text: '#FFFFFF',
    code: 'MI'
  },
  'Royal Challengers Bengaluru': {
    primary: '#EC1C24',
    secondary: '#15213B',
    accent: '#FCC419',
    text: '#FFFFFF',
    code: 'RCB'
  },
  'RCB': {
    primary: '#EC1C24',
    secondary: '#15213B',
    accent: '#FCC419',
    text: '#FFFFFF',
    code: 'RCB'
  },
  'Kolkata Knight Riders': {
    primary: '#3A225D',
    secondary: '#FCC419',
    accent: '#7048E8',
    text: '#FFFFFF',
    code: 'KKR'
  },
  'KKR': {
    primary: '#3A225D',
    secondary: '#FCC419',
    accent: '#7048E8',
    text: '#FFFFFF',
    code: 'KKR'
  },
  'Rajasthan Royals': {
    primary: '#EA1A85',
    secondary: '#254AA5',
    accent: '#D63384',
    text: '#FFFFFF',
    code: 'RR'
  },
  'RR': {
    primary: '#EA1A85',
    secondary: '#254AA5',
    accent: '#D63384',
    text: '#FFFFFF',
    code: 'RR'
  },
  'Sunrisers Hyderabad': {
    primary: '#F74400',
    secondary: '#09152F',
    accent: '#F76707',
    text: '#FFFFFF',
    code: 'SRH'
  },
  'SRH': {
    primary: '#F74400',
    secondary: '#09152F',
    accent: '#F76707',
    text: '#FFFFFF',
    code: 'SRH'
  },
  'Gujarat Titans': {
    primary: '#1C1C1C',
    secondary: '#FCC419',
    accent: '#22B8CF',
    text: '#FFFFFF',
    code: 'GT'
  },
  'GT': {
    primary: '#1C1C1C',
    secondary: '#FCC419',
    accent: '#22B8CF',
    text: '#FFFFFF',
    code: 'GT'
  },
  'Delhi Capitals': {
    primary: '#004C97',
    secondary: '#E03131',
    accent: '#22B8CF',
    text: '#FFFFFF',
    code: 'DC'
  },
  'DC': {
    primary: '#004C97',
    secondary: '#E03131',
    accent: '#22B8CF',
    text: '#FFFFFF',
    code: 'DC'
  },
  'Punjab Kings': {
    primary: '#DD1F2D',
    secondary: '#FCC419',
    accent: '#F76707',
    text: '#FFFFFF',
    code: 'PBKS'
  },
  'PBKS': {
    primary: '#DD1F2D',
    secondary: '#FCC419',
    accent: '#F76707',
    text: '#FFFFFF',
    code: 'PBKS'
  },
  'Lucknow Super Giants': {
    primary: '#0057E7',
    secondary: '#F76707',
    accent: '#22B8CF',
    text: '#FFFFFF',
    code: 'LSG'
  },
  'LSG': {
    primary: '#0057E7',
    secondary: '#F76707',
    accent: '#22B8CF',
    text: '#FFFFFF',
    code: 'LSG'
  },

  // 5 Historical Franchises (distinct identities)
  'Deccan Chargers': {
    primary: '#2E4166',
    secondary: '#D9B48F',
    accent: '#4DABF7',
    text: '#FFFFFF',
    code: 'DCG'
  },
  'DCG': {
    primary: '#2E4166',
    secondary: '#D9B48F',
    accent: '#4DABF7',
    text: '#FFFFFF',
    code: 'DCG'
  },
  'Pune Warriors': {
    primary: '#2F9EBB',
    secondary: '#C4C4C4',
    accent: '#22B8CF',
    text: '#FFFFFF',
    code: 'PWI'
  },
  'PWI': {
    primary: '#2F9EBB',
    secondary: '#C4C4C4',
    accent: '#22B8CF',
    text: '#FFFFFF',
    code: 'PWI'
  },
  'Gujarat Lions': {
    primary: '#E04F16',
    secondary: '#193A83',
    accent: '#FCC419',
    text: '#FFFFFF',
    code: 'GL'
  },
  'GL': {
    primary: '#E04F16',
    secondary: '#193A83',
    accent: '#FCC419',
    text: '#FFFFFF',
    code: 'GL'
  },
  'Rising Pune Supergiant': {
    primary: '#D11D5D',
    secondary: '#3A225D',
    accent: '#EA1A85',
    text: '#FFFFFF',
    code: 'RPS'
  },
  'RPS': {
    primary: '#D11D5D',
    secondary: '#3A225D',
    accent: '#EA1A85',
    text: '#FFFFFF',
    code: 'RPS'
  },
  'Kochi Tuskers Kerala': {
    primary: '#672054',
    secondary: '#FCC419',
    accent: '#7048E8',
    text: '#FFFFFF',
    code: 'KTK'
  },
  'KTK': {
    primary: '#672054',
    secondary: '#FCC419',
    accent: '#7048E8',
    text: '#FFFFFF',
    code: 'KTK'
  }
};

export const getFranchiseColor = (teamName) => {
  if (!teamName) return '#193A83';
  return FRANCHISE_COLORS[teamName]?.primary || '#193A83';
};

export const getFranchiseMetadata = (teamName) => {
  if (!teamName) {
    return {
      primary: '#193A83',
      secondary: '#10265B',
      accent: '#22B8CF',
      text: '#FFFFFF',
      code: 'IPL'
    };
  }
  return FRANCHISE_COLORS[teamName] || {
    primary: '#193A83',
    secondary: '#10265B',
    accent: '#22B8CF',
    text: '#FFFFFF',
    code: teamName.slice(0, 3).toUpperCase()
  };
};

