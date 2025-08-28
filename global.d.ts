// This file is required when using Typescript + React + ReactDOM + Babel
// because the language server has to detect JSX syntax.

// Tell TypeScript that `React` exists globally
declare const React: typeof import('react')
declare const ReactDOM: typeof import('react-dom')

// Make JSX compile to React.createElement without requiring imports
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any
  }
}
