module.exports = {
  app: {
    getPath: jest.fn(),
    getName: jest.fn(),
    getVersion: jest.fn(),
  },
  clipboard: jest.fn(),
  BrowserWindow: jest.fn().mockImplementation(() => {
    return {
      setBackgroundColor: jest.fn(),
      setAlwaysOnTop: jest.fn(),
      setVisibleOnAllWorkspaces: jest.fn(),
      setFullScreenable: jest.fn(),
      loadURL: jest.fn(),
      once: jest.fn(),
      close: jest.fn(),
      on: jest.fn(),
      webContents: {
        send: jest.fn(),
        on: jest.fn()
      }
    }
  })
};
