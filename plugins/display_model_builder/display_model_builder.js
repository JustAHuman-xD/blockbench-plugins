(() => {
    const repo = "JustAHuman-xD/DisplayModelBuilder"
    const id = "display_model_builder"
    const name = "Display Model Builder"
    const icon = "check_box_outline_blank"
    const author = "JustAHuman"
    const description = "Create Display Entity Models!"
    const links = {
        github: {
            text: "By JustAHuman",
            link: "https://github.com/JustAHuman-xD",
            icon: "fab.fa-github",
            colour: "#6E40C9"
        },
        discord: {
            text: "Discord Server",
            link: "https://discord.gg/y6fV6pbgHB",
            icon: "fab.fa-discord",
            colour: "#727FFF"
        },
        tutorial: {
            text: "Tutorial",
            link: "https://youtube.com",
            icon: "fab.fa-youtube",
            colour: "#FF4444"
        }
    }

    let format, action, dialog, mode, panel, styles, preview, debug, stats

    Plugin.register(id, {
        title: name,
        icon: icon,
        author: author,
        description: description,
        tags: ["Minecraft", "Model", "Entity"],
        version: "0.1.0",
        min_version: "4.8.0",
        variant: "both",
        creation_data: "2023-09-02",
        async onload() {

            styles = Blockbench.addCSS(`
                body:not(.is_mobile) #work_screen:has(#panel_display_model_render_panel:not(.hidden)) {
                    grid-template-columns: 0px auto 0 !important;
                }
                #panel_display_model_render_panel > .panel_handle, #work_screen:has(#panel_display_model_render_panel:not(.hidden)) > .resizer.vertical {
                    display: none !important;
                }
                #work_screen:has(#panel_display_model_render_panel:not(.hidden)) > #center {
                    margin-bottom: calc(4px - var(--toolbar-height));
                }
                #panel_display_model_render_panel {
                    width: 0px !important; 
                    height: 0px !important;
                }
                #display-model-render-controls-container {
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: 50px;
                    display: flex;
                    justify-content: center;
                }
                #display-model-render-controls {
                    background-color: var(--color-ui);
                    z-index: 2;
                    padding: 10px;
                    box-shadow: 0 5px 10px #0006;
                    display: flex;
                    gap: 10px;
                    align-items: center;
                    flex-direction: column;
                }
                #display-model-code-container {
                    overflow: auto;
                    flex: 1;
                    max-height: calc(100% - 40px);
                    min-height: 3.5em;
                    display: flex;
                }
                #display-model-code {
                    cursor: text;
                    flex: 1;
                }
                .display-model-render-controls-row {
                    display: flex;
                    gap: 20px;
                    align-items: center;
                }
                #display-model-render-button {
                    background-color: var(--color-close);
                    color: var(--color-light);
                    padding: 10px 30px 1px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: filter .15s;
                }
                #display-model-render-button:hover {
                    filter: brightness(1.25) hue-rotate(5deg);
                }
                #display-model-render-button.disabled {
                    background-color: var(--color-button);
                    cursor: not-allowed;
                }
                display-model-render-button.disabled:hover {
                    filter: initial;
                }
                .display-model-button {
                    cursor: pointer;
                    border-radius: 4px;
                }
                .display-model-button.selected {
                    background-color: var(--color-accent);
                    color: var(--color-accent_text);
                }
                .display-model-button.selected > svg {
                    fill: var(--color-accent_text);
                }
                #resolutions {
                    display: flex;
                    background-color: var(--color-button);
                    padding: 4px;
                }
                .resolution {
                    width: 32px;
                    height: 32px;
                }
                .resolution > i {
                    font-size: 32px;
                }
                .resolution > svg {
                    fill: var(--color-text);
                }
                .display-model-list {
                    display: flex;
                    max-height: 384px;
                    flex-wrap: wrap;
                    gap: 10px;
                    overflow-x: hidden;
                }
                .display-model-list.small {
                    max-height: 198px;
                }
                .display-model-item {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    padding: 10px 10px 5px;
                    background-color: var(--color-back);
                    align-items: center;
                    cursor: pointer;
                    flex: 1;
                    position: relative;
                }
                .display-model-item:hover {
                    background-color: var(--color-button);
                }
                .display-model-item > img {
                    max-width: 100px;
                    height: 50px;
                    display: flex;
                    object-fit: contain;
                }
                .display-model-item > div {
                    text-align: center;
                    flex: 1;
                    display: flex;
                    align-items: center;
                }
                .display-model-item.selected {
                    outline: 2px solid var(--color-accent);
                    background-color: var(--color-button);
                    outline-offset: -2px;
                }
                .display-model-item-has-variants {
                    display: flex;
                    position: absolute;
                    bottom: 4px;
                    right: 4px;
                    z-index: 1;
                }
                .display-model-links {
                    display: flex;
                    justify-content: space-around;
                    margin: 20px 40px 0;
                }
                .display-model-links > a {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 5px;
                    padding: 5px;
                    text-decoration: none;
                    flex-grow: 1;
                    flex-basis: 0;
                    color: var(--color-subtle_text);
                    text-align: center;
                }
                .display-model-links > a:hover {
                    background-color: var(--color-accent);
                    color: var(--color-light);
                }
                .display-model-links > a > i {
                    font-size: 32px;
                    width: 100%;
                    max-width: initial;
                    height: 32px;
                    text-align: center;
                }
                .display-model-links > a:hover > i {
                    color: var(--color-light) !important;
                }
                .display-model-links > a > p {
                    flex: 1;
                    display: flex;
                    align-items: center;
                }
                .spacer, #display_model_generator .sp-preview, #display_model_generator .form_inline_select > li {
                    flex: 1;
                }
                .display-model-item-buttons > i:hover, #display-model-preview-container > i:hover, .display-model-button:hover, #display-model-custom-texture > i:hover, .text-input-row > i:hover, .display-model-button:hover > svg {
                    color: var(--color-light);
                }
                .display-model-preset > *, .display-model-item *, .text-input-row > i:hover, #display-model-render-button-row *, .display-model-links * {
                    cursor: pointer;
                }
                #format_page_display_model {
                    padding-bottom: 0;
                }
            `)

            format = new ModelFormat({
                id: "display_model",
                name: "Display Model",
                icon,
                category: "minecraft",
                target: ["Minecraft"],
                model_identifier: false,
                rotate_cubes: true,
                uv_rotation: false,
                bone_rig: true,
                centered_grid: true,
                edit_mode: true,
                paint_mode: false,
                format_page: {
                    component: {
                        methods: { 
                        create: () => format.new()
                        },
                        template: `
                        <div style="display:flex;flex-direction:column;height:100%">
                            <p class="format_description">${description}</p>
                            <p class="format_target"><b>Target</b> : <span>Logos</span> <span>Renders</span> <span>Thumbnails</span></p>
                            <content>
                            <h3 class="markdown">What is this:</h3>
                            <p class="markdown">
                                <ul>
                                <li>This format is designed to create complex models using the new Display Entities!</li>
                                <li>This format will use block entities to best replicate whatever model you create</li>
                                <li>Keep in mind you are limited to the textures of exisiting minecraft blocks, no custom textures</li>
                                <li>When you are ready to export the plugin will give you the corresponding Model Types and Parameters to feed into DisplayModelLib!</li>
                                </ul>
                            </p>
                            </content>
                            <div class="spacer"></div>
                            <div class="display-model-links">${Object.values(links).map(e => `
                            <a href="${e.link}">
                                ${Blockbench.getIconNode(e.icon, e.colour).outerHTML}
                                <p>${e.text}</p>
                            </a>
                            `).join("")}</div>
                            <div class="button_bar">
                            <button id="create_new_model_button" style="margin-top:20px;margin-bottom:24px;" @click="create">
                                <i class="material-icons">${icon}</i>
                                Create New Display Model
                            </button>
                            </div>
                        </div>
                        `
                    }
                },
                new() {
                    newProject(this)
                    Project.texture_width = 0
                    Project.texture_height = 0
                }
            })

            panel = new Panel("display_model_code_panel", {
                name: "Model Code",
                icon: "code",
                growable: true,
                condition: {
                    formats: [format.id],
                },
                default_position: {
                    folded: true,
                    slot: "bottom"
                },
                component: {
                    components: {
                        VuePrismEditor
                    },
                    data: {
                        text: "// All of the Code will go here\n// Just Copy & Paste it into your Minecraft Plugin!",
                        readonly: true
                    },
                    methods: {
                        update() {

                        }
                    },
                    template: `
                        <div>
                            <div id="display_model_code_container">
                                <vue-prism-editor id="display_model_code" v-model="text" readonly=true language="java" line-numbers />
                            </div>
                        </div>
                    `
                }
            })

            Blockbench.on("finished_edit", () => {
                if (Project.format?.id == "display_model") {
                    let code = generateCode();
                    panel.vue.text = code;
                }
            })

            function generateCode() {
                let code = `new ModelBuilder()`;
                let elements = Project.elements;
                if (elements.length == 0) {
                    return `// There is nothing to display!
// Try adding some cubes to get started!`
                }

                elements.forEach(element => {
                    let size = element.getMesh().scale;
                    let position = element.getMesh().position;
                    let rotation = element.getMesh().rotation;
                    let id = element.name.toLowerCase().replace(" ", "_");
                    code = code + `
    .add(\"${id}\", new ModelCuboid()
        .size(${size.x}, ${size.y}, ${size.z})
        .position(${position.x}, ${position.y}, ${position.z})
        .rotation(${rotation.x}, ${rotation.y}, ${rotation.z}))`
                })

                return code
            }
        }
    });
})()