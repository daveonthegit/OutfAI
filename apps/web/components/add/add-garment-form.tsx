"use client";

import { cn } from "@/lib/utils";
import { AddGarmentFormFields } from "@/components/add/add-garment-form-fields";
import { AddGarmentSaveBar } from "@/components/add/add-garment-save-bar";
import { AddGarmentUploadPanel } from "@/components/add/add-garment-upload-panel";
import { BrutalistProgress } from "@/components/brutalist-progress";
import type { AddGarmentFormState } from "@/hooks/use-add-garment-form";

type AddGarmentFormProps = {
  form: AddGarmentFormState;
  className?: string;
  saveBarClassName?: string;
};

export function AddGarmentForm({
  form,
  className,
  saveBarClassName,
}: AddGarmentFormProps) {
  return (
    <div className={cn("space-y-8", className)}>
      {form.analyzeLoading && (
        <BrutalistProgress
          value={68}
          variant="orange"
          label="Analyzing image"
          showValue={false}
        />
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <AddGarmentUploadPanel
          fileInputRef={form.fileInputRef}
          dragActive={form.dragActive}
          previewUrl={form.previewUrl}
          analyzeLoading={form.analyzeLoading}
          analyzeError={form.analyzeError}
          onDrag={form.handleDrag}
          onDrop={form.handleDrop}
          onFileInputChange={form.handleInputChange}
          onAnalyze={() => void form.handleAnalyzeImage()}
          onClearImage={form.clearImage}
        />

        <AddGarmentFormFields
          garmentName={form.garmentName}
          onGarmentNameChange={form.setGarmentName}
          selectedCategory={form.selectedCategory}
          onSelectCategory={form.setSelectedCategory}
          selectedColor={form.selectedColor}
          onSelectColor={form.setSelectedColor}
          tags={form.tags}
          tagInput={form.tagInput}
          onTagInputChange={form.setTagInput}
          onAddTagKeyDown={form.handleAddTag}
          onRemoveTag={form.removeTag}
          selectedStyles={form.selectedStyles}
          onToggleStyle={form.toggleStyle}
          selectedFit={form.selectedFit}
          onSelectFit={form.setSelectedFit}
          selectedOccasions={form.selectedOccasions}
          onToggleOccasion={form.toggleOccasion}
          selectedVersatility={form.selectedVersatility}
          onSelectVersatility={form.setSelectedVersatility}
          selectedVibrancy={form.selectedVibrancy}
          onSelectVibrancy={form.setSelectedVibrancy}
        />
      </div>

      <AddGarmentSaveBar
        saveError={form.saveError}
        isComplete={form.isComplete}
        saving={form.saving}
        onSave={() => void form.handleSave()}
        className={saveBarClassName}
      />
    </div>
  );
}
