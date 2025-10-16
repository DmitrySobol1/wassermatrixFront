// Shared style constants to avoid recreating objects on each render

export const ACCOUNT_STYLES = {
  icon: { color: '#168acd' } as const,
  loadingContainer: {
    textAlign: 'center' as const,
    justifyContent: 'center',
    padding: '100px',
  } as const,
} as const;
