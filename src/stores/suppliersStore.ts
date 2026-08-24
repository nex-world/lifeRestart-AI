import { defineStore } from "pinia";
import { parse, stringify } from "zipson";
import { suppliers as builtinSuppliers, type SupplierDict } from "llm-utils";

export type CustomSupplier = Partial<SupplierDict> & {
  name: string;
  baseUrl: string;
  label?: string;
  defaultModel?: string;
  modelsUrl?: string;
};

export const useSuppliersStore = defineStore("lifeRestartSuppliers", {
  state: () => ({
    customSuppliers: [] as CustomSupplier[],
  }),
  getters: {
    allSuppliers(state): SupplierDict[] {
      const custom = state.customSuppliers.map((supplier) => ({
        name: supplier.name,
        desc: supplier.label || supplier.name,
        docUrl: "",
        baseUrl: supplier.baseUrl,
        defaultModel: supplier.defaultModel || "",
        chatUrl: "/chat/completions",
        modelsUrl: supplier.modelsUrl || "/models",
        models: supplier.models,
      })) as SupplierDict[];

      const seen = new Set<string>();
      return [...custom, ...builtinSuppliers].filter((supplier) => {
        if (seen.has(supplier.name)) return false;
        seen.add(supplier.name);
        return true;
      });
    },
    customSupplierNames(state): string[] {
      return state.customSuppliers.map((supplier) => supplier.name);
    },
  },
  actions: {
    addSupplier(input: CustomSupplier): CustomSupplier | null {
      const name = input.name?.trim();
      const baseUrl = normalizeBaseUrl(input.baseUrl);
      if (!name || !baseUrl) return null;

      let finalName = name;
      while (
        builtinSuppliers.some((supplier) => supplier.name === finalName) ||
        this.customSuppliers.some((supplier) => supplier.name === finalName)
      ) {
        finalName = `${finalName}*`;
      }

      const supplier: CustomSupplier = {
        name: finalName,
        baseUrl,
        label: cleanOptional(input.label),
        defaultModel: cleanOptional(input.defaultModel),
        modelsUrl: normalizeModelsUrl(input.modelsUrl),
      };
      this.customSuppliers.unshift(supplier);
      return supplier;
    },
    updateSupplier(name: string, patch: Partial<CustomSupplier>): CustomSupplier | null {
      const index = this.customSuppliers.findIndex((supplier) => supplier.name === name);
      if (index < 0) return null;

      const current = this.customSuppliers[index];
      const baseUrl = patch.baseUrl === undefined ? current.baseUrl : normalizeBaseUrl(patch.baseUrl);
      if (!baseUrl) return null;

      const updated: CustomSupplier = {
        ...current,
        ...patch,
        name: current.name,
        baseUrl,
        label: cleanOptional(patch.label ?? current.label),
        defaultModel: cleanOptional(patch.defaultModel ?? current.defaultModel),
        modelsUrl: normalizeModelsUrl(patch.modelsUrl ?? current.modelsUrl),
      };
      this.customSuppliers.splice(index, 1, updated);
      return updated;
    },
    removeSupplier(name: string): boolean {
      const index = this.customSuppliers.findIndex((supplier) => supplier.name === name);
      if (index < 0) return false;
      this.customSuppliers.splice(index, 1);
      return true;
    },
  },
  persist: {
    serializer: {
      deserialize: parse,
      serialize: stringify,
    },
  },
});

function cleanOptional(value?: string): string | undefined {
  return value?.trim() || undefined;
}

function normalizeBaseUrl(value?: string): string {
  return value?.trim().replace(/\/+$/, "") || "";
}

function normalizeModelsUrl(value?: string): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}
