// Shared style constants to avoid recreating objects on each render

export const ACCOUNT_STYLES = {
  icon: { color: '#168acd' } as const,
  loadingContainer: {
    textAlign: 'center' as const,
    justifyContent: 'center',
    padding: '100px',
  } as const,
  sectionMarginBottom: {
    marginBottom: 10,
  } as const,
  sectionMarginBottomLarge: {
    marginBottom: 100,
  } as const,
} as const;
