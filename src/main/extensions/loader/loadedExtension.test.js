import LoadedExtension from "./loadedExtension"


const instance = {
  fakeMethod: () => { }
};

describe("LoadedExtension", () => {
  test("Stores instance", () => {
    const fakeInst = {
      fakeMethod: () => { }
    };
    const loaded = new LoadedExtension(fakeInst, {}, "fakePath");

    expect(loaded.instance).toBe(fakeInst);
  })

  test("Stores extensionPath", () => {
    const loaded = new LoadedExtension(instance, {}, "extPath");

    expect(loaded.extensionPath).toBe("extPath");
  });

  describe("configuration properties", () => {

    test("stores configuration", () => {
      const conf = {
        name: 'name'
      }

      const loaded = new LoadedExtension(instance, conf, "extPath");

      expect(loaded.configuration).toBe(conf);
    });

    test("name() returns name", () => {
      const conf = {
        name: 'myName'
      }

      const loaded = new LoadedExtension(instance, conf, "extPath");

      expect(loaded.name()).toBe('myName');
    });

    test("type() returns type", () => {
      const conf = {
        type: 'detector'
      }

      const loaded = new LoadedExtension(instance, conf, "extPath");

      expect(loaded.type()).toBe('detector');
    });

    test("display() uses prop when it exists", () => {
      const conf = {
        display: 'overriden'
      }

      const loaded = new LoadedExtension(instance, conf, "extPath");

      expect(loaded.display()).toBe('overriden');
    });

    test("display() uses name when display doesn't exist", () => {
      const conf = {
        name: 'name'
      }

      const loaded = new LoadedExtension(instance, conf, "extPath");

      expect(loaded.display()).toBe('name');
    });


    test("description() uses prop when it exists", () => {
      const conf = {
        description: 'overriden'
      }

      const loaded = new LoadedExtension(instance, conf, "extPath");

      expect(loaded.description()).toBe('overriden');
    });

    test("description() uses name when description doesn't exist", () => {
      const conf = {
        name: 'name'
      }

      const loaded = new LoadedExtension(instance, conf, "extPath");

      expect(loaded.description()).toBe('name');
    });
  });

  test("marks extension as built in", () => {
    const loaded = new LoadedExtension(instance, { name: 'ext' }, "extPath");

    loaded.markBuiltIn();

    expect(loaded.isBuiltIn()).toBe(true);
  });

  test("isBuiltIn defaults to false", () => {
    const loaded = new LoadedExtension(instance, { name: 'ext' }, "extPath");

    expect(loaded.isBuiltIn()).toBe(false);
  });
})