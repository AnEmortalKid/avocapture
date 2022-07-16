import { app, clipboard } from 'electron';

import PathReader from './pathReader';

describe('sample setup', () => {
  test("is mocked", () => {
    app.getPath.mockReturnValue("sampleDir");
    clipboard.writeText = jest.fn()

    const pr = PathReader.create();

    expect(clipboard.writeText).toHaveBeenCalledWith('sampleDir');
  });
});