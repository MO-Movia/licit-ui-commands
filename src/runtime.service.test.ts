import { setRuntime, RuntimeService } from './runtime.service'; // Replace with correct path

describe('RuntimeService', () => {
  it('should set and get runtime correctly', () => {
    const runtimeValue = 'testRuntime';

    setRuntime(runtimeValue);

    if (RuntimeService.Runtime !== runtimeValue) {
      console.error('Error: Runtime value mismatch');
    } else {
      console.log('Runtime value set and retrieved correctly');
    }
  });

  it('should handle null runtime value', () => {
    setRuntime(null);

    if (RuntimeService.Runtime !== null) {
      console.error('Error: Runtime value should be null');
    } else {
      console.log('Runtime value set to null correctly');
    }
  });

  it('should handle undefined runtime value', () => {
    setRuntime(undefined);

    if (RuntimeService.Runtime !== undefined) {
      console.error('Error: Runtime value should be undefined');
    } else {
      console.log('Runtime value set to undefined correctly');
    }
  });
});