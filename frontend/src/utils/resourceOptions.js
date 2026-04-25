export const RESOURCE_LABELS = [
  'Computing Faculty',
  'Business School',
  'Engineering Faculty',
  'Humanities and Sciences Faculty',
  'Common Area'
]

export const FACULTY_RESOURCE_TYPES = [
  'Lecture Hall',
  'Practical Lab',
  'Conference Hall'
]

export const COMMON_RESOURCE_TYPES = [
  'Open Area',
  'Indoor Area',
  'Open Study Area',
  'Library',
  'Canteen',
  'Indoor Sports Arena',
  'Outdoor Sports Area'
]

export const LABEL_CODE_PREFIX = {
  'Computing Faculty': 'IT',
  'Business School': 'BS',
  'Engineering Faculty': 'EN',
  'Humanities and Sciences Faculty': 'HS',
  'Common Area': 'CO'
}

export const getResourceTypesByLabel = (label) => {
  if (!label) return []

  if (label === 'Common Area') {
    return COMMON_RESOURCE_TYPES
  }

  return FACULTY_RESOURCE_TYPES
}

export const getCodePrefixByLabel = (label) => {
  return LABEL_CODE_PREFIX[label] || ''
}