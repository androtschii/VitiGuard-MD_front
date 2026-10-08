import { Component, type ErrorInfo, type ReactNode } from 'react'

type ErrorBoundaryProps = {
  fallback: (reset: () => void) => ReactNode
  onError?: (error: Error, info: ErrorInfo) => void
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

// Перехватывать ошибки отрисовки умеют только классовые компоненты
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info)
  }

  reset = () => {
    this.setState({ hasError: false })
  }

  render() {
    return this.state.hasError
      ? this.props.fallback(this.reset)
      : this.props.children
  }
}
