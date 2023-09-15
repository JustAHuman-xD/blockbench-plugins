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

    let format, action, panel, property, dialog, material_data

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

            material_data = await fetch("https://raw.githubusercontent.com/JustAHuman-xD/DisplayModelBuilderData/main/data/materials.json").then(e => e.json());

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
                            <p class="format_target"><b>Minecraft</b> : <span>Model</span> <span>Renders</span> <span>Entity</span></p>
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
            });

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
                        text: `// There is nothing to display!
// Try adding some cubes to get started!`
                    },
                    methods: {
                        update() {

                        }
                    },
                    template: `
                        <div>
                            <vue-prism-editor v-model="text" language="json" readonly=true line-numbers />
                        </div>
                    `
                }
            });

            dialog = new Dialog({
                title: "Change Material",
                id: "material_dialog",
                form: {
                    material: {label: "Material", type: "select", options: generateMaterialOptions()}
                },
                onConfirm(form_data) {
                    let new_material = form_data.material;
                    let model = getModel(new_material);
                    let cubeModel = getCubeModel(model);
                    let textures = getTextures(new_material);
                    Cube.selected.forEach(obj => {
                        obj.material = new_material;
                    })
                    panel.vue.text = "material: " + String(new_material) + "\nmodel: " + String(JSON.stringify(model)) + "\ncubemodel: " + String(JSON.stringify(cubeModel)) + "\ntextures: " + String(Array.from(textures).join(' '))
                }
            })

            property = new Property(Cube, 'string', 'material', {
                default: "stone",
                exposed: true
            });

            action = new Action("change_material", {
                name: "Change Material",
                description: "Change the material of the cube, this is used for the generated block display!",
                icon: icon,
                linked_setting: 'material',
                condition: {
                    formats: [format.id]
                },
                click(event) {
                    dialog.show();
                }
            });

            Cube.prototype.menu.addAction(action, 8)

            Blockbench.on("finished_edit", updatePanel)

            function updatePanel() {
                if (Project.format?.id == "display_model") {
                    let code = generateCode();
                    panel.vue.text = code;
                }
            }

            function nameToId(name) {
                return name.toLowerCase().replaceAll(" ", "_");
            }

            function generateMaterialOptions() {
                let options = {}
                material_data.forEach(material => {
                    options[material] = material.substring(0, 1).toUpperCase() + material.substring(1).replaceAll("_", " ");
                })
                return options;
            }

            async function getModel(material) {
                return fetch("https://raw.githubusercontent.com/JustAHuman-xD/DisplayModelBuilderData/main/data/models/" + material + ".json").then(e => e.json());
            }

            async function getCubeModel(model) {
                let parent = model["parent"].substring(16) + ".json"
                return fetch("https://raw.githubusercontent.com/JustAHuman-xD/DisplayModelBuilderData/main/data/parents/" + parent).then(e => e.json());
            }

            async function getTextures(model) {
                let textures = new Set();
                for (let path in model["textures"]) {
                    textures.add("https://raw.githubusercontent.com/JustAHuman-xD/DisplayModelBuilderData/main/data/textures/" + path);
                }
                return textures;
            }

            function generateCode() {
                let code = `new ModelBuilder()`;
                let elements = Project.elements;
                if (elements.length == 0) {
                    return `// There is nothing to display!
// Try adding some cubes to get started!`
                }

                let ids = new Set();
                let duplicate = false;
                elements.forEach(element => {
                    let id = nameToId(element.name);
                    if (ids.has(id)) {
                        duplicate = true;
                    }
                    ids.add(id);
                })

                if (duplicate) {
                    return `// There are duplicate id's!
// Change the names to remove duplicates!`
                }

                elements.forEach(element => {
                    let from = element.from;
                    let to = element.to;
                    let rotation = element.getMesh().rotation;
                    let scale = [Math.abs(from[0] - to[0]), Math.abs(from[1] - to[1]), Math.abs(from[2] - to[2])];
                    let position = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2]
                    let material = element.material.toUpperCase();
                    let id = nameToId(element.name);

                    code = code + `
    .add(\"${id}\", new ModelCuboid()
        .material(Material.${material})
        .size(${scale[0]}, ${scale[1]}, ${scale[2]})
        .position(${position[0]}, ${position[1]}, ${position[2]})
        .rotation(${rotation.x}, ${rotation.y}, ${rotation.z}))`
                })

                return code
            }

            updatePanel()
        }
    });
})()