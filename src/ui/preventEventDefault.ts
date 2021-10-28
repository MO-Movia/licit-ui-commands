import * as React from 'react';

export default function preventEventDefault(e: React.SyntheticEvent): void {
  e.preventDefault();
}
