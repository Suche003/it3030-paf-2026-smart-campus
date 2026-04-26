export const RESOURCE_KINDS = {
  VENUE: 'VENUE',
  EQUIPMENT: 'EQUIPMENT'
}

export const VENUE_CATEGORIES = [
  'Computing Faculty',
  'Business School',
  'Engineering Faculty',
  'Humanities and Sciences Faculty',
  'Common Area'
]

export const EQUIPMENT_CATEGORIES = [
  'Portable',
  'Fixed'
]

export const FACULTY_VENUE_TYPES = [
  'Lecture Hall',
  'Practical Lab',
  'Conference Hall'
]

export const COMMON_VENUE_TYPES = [
  'Open Area',
  'Indoor Area',
  'Open Study Area',
  'Library',
  'Canteen',
  'Indoor Sports Arena',
  'Outdoor Sports Area'
]

export const EQUIPMENT_TYPES = [
  'Projector',
  'Camera',
  'TV',
  'Microphone',
  'Speaker',
  'Laptop',
  'Printer',
  'Extension Cable',
  'Other Equipment'
]

export const LABEL_CODE_PREFIX = {
  'Computing Faculty': 'IT',
  'Business School': 'BS',
  'Engineering Faculty': 'EN',
  'Humanities and Sciences Faculty': 'HS',
  'Common Area': 'CO',
  Portable: 'EQ',
  Fixed: 'EQ'
}

export const getCategoriesByKind = (resourceKind) => {
  if (resourceKind === RESOURCE_KINDS.EQUIPMENT) return EQUIPMENT_CATEGORIES
  if (resourceKind === RESOURCE_KINDS.VENUE) return VENUE_CATEGORIES
  return []
}

export const getTypesByKindAndCategory = (resourceKind, category) => {
  if (!resourceKind || !category) return []

  if (resourceKind === RESOURCE_KINDS.EQUIPMENT) {
    return EQUIPMENT_TYPES
  }

  if (category === 'Common Area') {
    return COMMON_VENUE_TYPES
  }

  return FACULTY_VENUE_TYPES
}

export const getCodePrefixByLabel = (label) => {
  return LABEL_CODE_PREFIX[label] || ''
}

export const isEquipment = (resourceKind) => {
  return resourceKind === RESOURCE_KINDS.EQUIPMENT
}

export const getKindLabel = (resourceKind) => {
  if (resourceKind === RESOURCE_KINDS.EQUIPMENT) return 'Equipment'
  if (resourceKind === RESOURCE_KINDS.VENUE) return 'Venue'
  return 'Resource'
}