export const ExtensionEvents = {
  EXTENSION_SETTINGS: {
    /**
     * The extension in context had its settings applied
     */
    APPLY: "ExtensionSettings.Apply",
    /**
     * The extension in context did not have settings changed
     */
    CANCEL: "ExtensionSettings.Cancel",
    /**
     * Prepare the extension settings system to edit an extension's settings
     */
    EDIT: "ExtensionSettings.Edit",
    /**
     * Prefix used when sending initialize events to a specific extension
     */
    INITIALIZE_PREFIX: "ExtensionSettings.Initialize.",
  },
  EXTENSION_MANAGEMENT: {
    INITIALIZE: "ExtensionManagement.Initialize",
    UNINSTALL: "ExtensionManagement.Unintstall",
    INSTALL: "ExtensionManagement.Intstall"
  }
}