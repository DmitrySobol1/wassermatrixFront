export const STYLES = {
  loadingContainer: {
    textAlign: 'center' as const,
    justifyContent: 'center' as const,
    padding: '100px',
  },
  saleBadge: {
    color: 'white',
    backgroundColor: '#ed6c02',
    padding: 10,
    marginLeft: 20,
  },
  strikethrough: {
    textDecoration: 'line-through' as const,
  },
  flexContainer: {
    display: 'flex' as const,
  },
  chipButton: {
    backgroundColor: '#a2d7f6ff',
    padding: '3px 15px 3px 15px',
    color: 'white',
  },
  chipButtonWide: {
    backgroundColor: '#a2d7f6ff',
    padding: '3px 10px 3px 10px',
    color: 'white',
    minWidth: 100,
    textAlign: 'center' as const,
  },
  bottomSection: {
    marginBottom: 100,
    padding: 10,
  },
  errorMessageStyle: {
    color: 'red',
  marginBottom: '10px',
  }
} as const;


