"""
backend/services/team_registry.py
Canonical IPL Team Registry and franchise identity management.
Defines official franchise metadata, standard aliases, active vs historical status,
and color identities inspired by IPL official branding.
"""

from typing import Dict, Optional, List

# Official 10 Active Franchises in the IPL
ACTIVE_FRANCHISES = {
    "Chennai Super Kings": {
        "code": "CSK",
        "short_name": "CSK",
        "active": True,
        "founded": 2008,
        "primary_color": "#FDB913",
        "secondary_color": "#0081E9",
        "text_color": "#000000",
        "aliases": ["CSK"]
    },
    "Delhi Capitals": {
        "code": "DC",
        "short_name": "DC",
        "active": True,
        "founded": 2008,
        "primary_color": "#004C97",
        "secondary_color": "#D71920",
        "text_color": "#FFFFFF",
        "aliases": ["Delhi Daredevils", "DC", "DD"]
    },
    "Gujarat Titans": {
        "code": "GT",
        "short_name": "GT",
        "active": True,
        "founded": 2022,
        "primary_color": "#1C1C1C",
        "secondary_color": "#E5C378",
        "text_color": "#FFFFFF",
        "aliases": ["GT"]
    },
    "Kolkata Knight Riders": {
        "code": "KKR",
        "short_name": "KKR",
        "active": True,
        "founded": 2008,
        "primary_color": "#3A225D",
        "secondary_color": "#EDAE11",
        "text_color": "#FFFFFF",
        "aliases": ["KKR"]
    },
    "Lucknow Super Giants": {
        "code": "LSG",
        "short_name": "LSG",
        "active": True,
        "founded": 2022,
        "primary_color": "#0057E7",
        "secondary_color": "#FF6600",
        "text_color": "#FFFFFF",
        "aliases": ["LSG"]
    },
    "Mumbai Indians": {
        "code": "MI",
        "short_name": "MI",
        "active": True,
        "founded": 2008,
        "primary_color": "#004BA0",
        "secondary_color": "#D1AB3E",
        "text_color": "#FFFFFF",
        "aliases": ["MI"]
    },
    "Punjab Kings": {
        "code": "PBKS",
        "short_name": "PBKS",
        "active": True,
        "founded": 2008,
        "primary_color": "#DD1F2D",
        "secondary_color": "#CBA92B",
        "text_color": "#FFFFFF",
        "aliases": ["Kings XI Punjab", "KXIP", "PBKS"]
    },
    "Rajasthan Royals": {
        "code": "RR",
        "short_name": "RR",
        "active": True,
        "founded": 2008,
        "primary_color": "#EA1A85",
        "secondary_color": "#254AA5",
        "text_color": "#FFFFFF",
        "aliases": ["RR"]
    },
    "Royal Challengers Bengaluru": {
        "code": "RCB",
        "short_name": "RCB",
        "active": True,
        "founded": 2008,
        "primary_color": "#EC1C24",
        "secondary_color": "#000000",
        "text_color": "#FFFFFF",
        "aliases": ["Royal Challengers Bangalore", "RCB"]
    },
    "Sunrisers Hyderabad": {
        "code": "SRH",
        "short_name": "SRH",
        "active": True,
        "founded": 2013,
        "primary_color": "#F74400",
        "secondary_color": "#000000",
        "text_color": "#FFFFFF",
        "aliases": ["SRH"]
    }
}

# Historical / Defunct Franchises
HISTORICAL_FRANCHISES = {
    "Deccan Chargers": {
        "code": "DCG",
        "short_name": "DCG",
        "active": False,
        "years_active": "2008-2012",
        "primary_color": "#2E4166",
        "secondary_color": "#D9B48F",
        "text_color": "#FFFFFF",
        "aliases": ["DCG"]
    },
    "Kochi Tuskers Kerala": {
        "code": "KTK",
        "short_name": "KTK",
        "active": False,
        "years_active": "2011",
        "primary_color": "#672054",
        "secondary_color": "#E5A023",
        "text_color": "#FFFFFF",
        "aliases": ["KTK"]
    },
    "Pune Warriors": {
        "code": "PWI",
        "short_name": "PWI",
        "active": False,
        "years_active": "2011-2013",
        "primary_color": "#2F9EBB",
        "secondary_color": "#C4C4C4",
        "text_color": "#FFFFFF",
        "aliases": ["Pune Warriors India", "PWI"]
    },
    "Gujarat Lions": {
        "code": "GL",
        "short_name": "GL",
        "active": False,
        "years_active": "2016-2017",
        "primary_color": "#E04F16",
        "secondary_color": "#26355D",
        "text_color": "#FFFFFF",
        "aliases": ["GL"]
    },
    "Rising Pune Supergiant": {
        "code": "RPS",
        "short_name": "RPS",
        "active": False,
        "years_active": "2016-2017",
        "primary_color": "#D11D5D",
        "secondary_color": "#5A287E",
        "text_color": "#FFFFFF",
        "aliases": ["Rising Pune Supergiants", "RPSG", "RPS"]
    }
}

ALL_FRANCHISES = {**ACTIVE_FRANCHISES, **HISTORICAL_FRANCHISES}

# Alias Lookup Map
ALIAS_MAP: Dict[str, str] = {}
for canonical, meta in ALL_FRANCHISES.items():
    ALIAS_MAP[canonical.lower()] = canonical
    for alias in meta.get("aliases", []):
        ALIAS_MAP[alias.lower()] = canonical

def normalize_team_name(name: Optional[str]) -> Optional[str]:
    """
    Normalizes any team name or alias to its canonical franchise name.
    Preserves historical identity while resolving legitimate renames.
    Safely handles float NaN, None, 'nan', 'null', and empty strings.
    """
    if name is None:
        return None
    # Check for pandas/numpy NaN
    try:
        if isinstance(name, float) and (name != name):  # NaN != NaN
            return None
    except Exception:
        pass
    cleaned = str(name).strip()
    if not cleaned or cleaned.lower() in ("nan", "none", "null", ""):
        return None
    return ALIAS_MAP.get(cleaned.lower(), cleaned)

def is_active_franchise(team_name: str) -> bool:
    """Checks if a canonical team name is an active current franchise."""
    canonical = normalize_team_name(team_name)
    return canonical in ACTIVE_FRANCHISES

def get_team_metadata(team_name: str) -> Dict:
    """Returns canonical franchise metadata, colors, and badge information."""
    canonical = normalize_team_name(team_name) or team_name
    return ALL_FRANCHISES.get(canonical, {
        "code": "".join(w[0] for w in canonical.split() if w)[:4].upper(),
        "short_name": canonical,
        "active": False,
        "primary_color": "#38bdf8",
        "secondary_color": "#1e293b",
        "text_color": "#FFFFFF",
        "aliases": []
    })
