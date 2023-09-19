import compareNumber from './compareNumber';

describe('compareNumber', () => {
    it('returns 1 when the first number is greater than the second', () => {
      expect(compareNumber(5, 2)).toBe(1);
    });

    it('returns -1 when the first number is less than the second', () => {
      expect(compareNumber(2, 5)).toBe(-1);
    });

    it('returns 0 when the numbers are equal', () => {
      expect(compareNumber(3, 3)).toBe(0);
    });
  });