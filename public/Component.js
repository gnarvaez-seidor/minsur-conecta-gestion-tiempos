/**
 * Component.js — UI5 wrapper that mounts the Next.js static export inside SAP Build Work Zone.
 *
 * WORKZONE THEME BRIDGE -> React:
 *   - On iframe creation it reads `sap.ui.getCore().getConfiguration().getTheme()`
 *     and passes it as the query param `?wzTheme=...` for the INITIAL theme.
 *   - It subscribes to `attachThemeChanged` and forwards runtime theme switches to the
 *     iframe via postMessage `{ source: 'workzone-bridge', type: 'theme-changed', theme }`.
 *   - The React side consumes it with `WorkzoneThemeContext` (src/context/).
 *
 * The `sap.app.id` below MUST match public/manifest.json (it derives the dotless serving path).
 */
sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/core/HTML"],
    function (UIComponent, HTML) {
        "use strict";

        return UIComponent.extend("minsur.conecta.gestion.workzone.react.Component", {

            metadata: {
                manifest: "json"
            },

            createContent: function () {
                var sId   = this.getMetadata().getManifestEntry("sap.app").id;
                var sPath = sId.replace(/\./g, "/");
                var sBase = sap.ui.require.toUrl(sPath);

                // 1. Detect the current Workzone theme for the initial load
                var sTheme = "";
                try {
                    sTheme = sap.ui.getCore().getConfiguration().getTheme();
                } catch (e) {
                    // If the API is unavailable, fall back to empty
                    // (the React hook will use prefers-color-scheme).
                }

                // 2. Create the iframe with the theme in a query param
                var sIframeId = "wzReactIframe_" + sId.replace(/[^a-zA-Z0-9]/g, "_");
                var sUrl      = sBase + "/index.html" +
                    (sTheme ? "?wzTheme=" + encodeURIComponent(sTheme) : "");

                var oHtml = new HTML({
                    content: "<iframe id='" + sIframeId + "' src='" + sUrl + "' " +
                        "style='width:100%;height:100%;border:none;display:block;'></iframe>"
                });

                // 3. Forward runtime theme changes -> postMessage to the iframe
                var fnHandler = function (oEvent) {
                    var sNewTheme = oEvent && oEvent.getParameter
                        ? oEvent.getParameter("theme")
                        : null;
                    var oIframe = document.getElementById(sIframeId);
                    if (oIframe && oIframe.contentWindow && sNewTheme) {
                        oIframe.contentWindow.postMessage({
                            source: "workzone-bridge",
                            type:   "theme-changed",
                            theme:  sNewTheme
                        }, "*");
                    }
                };
                try {
                    sap.ui.getCore().attachThemeChanged(fnHandler);
                    this._fnThemeHandler = fnHandler;
                } catch (e) {
                    // attachThemeChanged unavailable — iframe still works, just no runtime reaction.
                }

                return oHtml;
            },

            exit: function () {
                if (this._fnThemeHandler) {
                    try {
                        sap.ui.getCore().detachThemeChanged(this._fnThemeHandler);
                    } catch (e) { /* noop */ }
                    this._fnThemeHandler = null;
                }
            }
        });
    }
);
