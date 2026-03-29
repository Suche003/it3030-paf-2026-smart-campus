export const RESOURCE_LABELS = [
  'Computing Faculty',
  'Business School',
  'Engineering Faculty',
  'Humanities and Sciences Faculty',
  'Common Area'
]

export const FACULTY_TYPES = [
  'Lecture Hall',
  'Practical Lab',
  'Conference Hall'
]

export const COMMON_TYPES = [
  'Open Area',
  'Indoor Area',
  'Open Study Area',
  'Library',
  'Canteen',
  'Indoor Sports Arena',
  'Outdoor Sports Area'
]

export const getTypesByLabel = (label) => {
  if (label === 'Common Area') {
    return COMMON_TYPES
  }

  if (!label) {
    return []
  }

  return FACULTY_TYPES
}