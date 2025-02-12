import MetadataMenu from "main";
import { Menu, TFile } from "obsidian";
import { replaceValues } from "src/commands/replaceValues";
import FieldCommandSuggestModal from "src/options/FieldCommandSuggestModal";
import BooleanModal from "src/optionModals/fields/BooleanModal";
import { FieldType, FieldIcon } from "src/types/fieldTypes";
import Field from "../Field";
import { FieldManager } from "../FieldManager";

export default class BooleanField extends FieldManager {

    constructor(plugin: MetadataMenu, field: Field) {
        super(plugin, field, FieldType.Boolean)
    }

    public addFieldOption(name: string, value: string, file: TFile, location: Menu | FieldCommandSuggestModal): void {
        const bValue = BooleanField.stringToBoolean(value);
        if (BooleanField.isMenu(location)) {
            location.addItem((item) => {
                item.setTitle(`<${name}> ${bValue ? "✅ ▷ ❌" : "❌ ▷ ✅"}`);
                item.setIcon(FieldIcon[FieldType.Boolean]);
                item.onClick(async () => await this.plugin.fileTaskManager
                    .pushTask(() => { replaceValues(this.plugin, file, name, (!bValue).toString()) }));
                item.setSection("metadata-menu.fields");
            })
        } else if (BooleanField.isSuggest(location)) {
            location.options.push({
                id: `update_${name}`,
                actionLabel: `<span><b>${name}</b> ${bValue ? "✅ ▷ ❌" : "❌ ▷ ✅"}</span>`,
                action: async () => await this.plugin.fileTaskManager
                    .pushTask(() => { replaceValues(this.plugin, file, name, (!bValue).toString()) }),
                icon: FieldIcon[FieldType.Boolean]
            });
        };
    };
    public getOptionsStr(): string {
        return ""
    }

    public createSettingContainer(parentContainer: HTMLDivElement, plugin: MetadataMenu): void {
        //no need of settings for boolean field
    }

    public validateValue(value: string): boolean {
        try {
            const bValue = BooleanField.stringToBoolean(value)
            return isBoolean(bValue)
        } catch (error) {
            return false
        }
    }

    public validateOptions(): boolean {
        //always true since there are no options
        return true
    }

    public createAndOpenFieldModal(file: TFile, selectedFieldName: string, value?: string, lineNumber?: number, inFrontmatter?: boolean, after?: boolean): void {
        const bValue = BooleanField.stringToBoolean(value || "false");
        const fieldModal = new BooleanModal(this.plugin, file, this.field, bValue, lineNumber, inFrontmatter, after)
        fieldModal.titleEl.setText(`Set value for ${selectedFieldName}`);
        fieldModal.open();
    }

    public createDvField(
        dv: any,
        p: any,
        fieldContainer: HTMLElement,
        attrs?: { cls?: string, attr?: Record<string, string>, options?: Record<string, string> }
    ): void {
        const checkbox: HTMLInputElement = dv.el("input", "", { ...attrs, "type": "checkbox" })
        checkbox.checked = p[this.field.name]
        fieldContainer.appendChild(checkbox)
        checkbox.onchange = (value) => {
            BooleanField.replaceValues(this.plugin, p.file.path, this.field.name, checkbox.checked.toString());
        }
    }
}