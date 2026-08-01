"use client";

import React, { useState, useCallback, useEffect } from "react";
import DOMPurify from "dompurify";
import { 
  Award, 
  Link2, 
  Unlink2, 
  Loader2,
  AlertCircle,
  CheckCircle,
  Eye,
  Edit2,
  FileText,
} from "lucide-react";
import { useCourseBuilder } from "../hooks";
import type { CertificateTemplate } from "../types";
import { Section, Button, Badge, Card, EmptyState, Alert, Modal } from "../ui";

interface CertificatesStepProps {
  draft: any;
  onChange: (data: Partial<any>) => void;
  isDirty: boolean;
}

export const CertificatesStep: React.FC<CertificatesStepProps> = ({ 
  draft, 
  onChange, 
  isDirty 
}) => {
  const {
    certificateTemplates,
    loadCertificateTemplates,
    assignCertificateTemplate,
    removeCertificateTemplate,
    isLoading,
    error,
    clearError,
  } = useCourseBuilder({ courseId: draft?.id });
  
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [currentTemplate, setCurrentTemplate] = useState<CertificateTemplate | null>(null);
  
  useEffect(() => {
    loadCertificateTemplates();
  }, [loadCertificateTemplates]);
  
  const currentTemplateId = draft?.certificateTemplate;
  const hasCertificate = draft?.hasCertificate;
  
  const handleAssign = useCallback(async (templateId: string) => {
    try {
      await assignCertificateTemplate(templateId);
      onChange({ ...draft, certificateTemplate: templateId, hasCertificate: true });
    } catch (err) {
      console.error("Failed to assign certificate:", err);
    }
  }, [assignCertificateTemplate, draft, onChange]);
  
  const handleRemove = useCallback(async () => {
    if (!confirm("هل أنت متأكد من إزالة قالب الشهادة؟")) return;
    try {
      await removeCertificateTemplate();
      onChange({ ...draft, certificateTemplate: null, hasCertificate: false });
    } catch (err) {
      console.error("Failed to remove certificate:", err);
    }
  }, [removeCertificateTemplate, draft, onChange]);
  
  const handlePreview = useCallback((template: CertificateTemplate) => {
    setCurrentTemplate(template);
    setShowPreview(template.templateHtml);
  }, []);
  
  return (
    <div className="space-y-6">
      <Section title="إدارة الشهادات" description="تعيين قوالب الشهادات للكورس" icon={<Award className="w-5 h-5" />}>
        {error && (
          <Alert variant="destructive" onClose={clearError} className="mb-4">
            <AlertCircle className="w-4 h-4" />
            <span>{error.message}</span>
          </Alert>
        )}
        
        {isDirty && (
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="w-4 h-4" />
            <span>لديك تغييرات غير محفوظة. سيتم الحفظ تلقائياً بعد التوقف عن الكتابة.</span>
          </Alert>
        )}
        
        {/* Current Certificate */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">الشهادة الحالية</h3>
          
          {hasCertificate && currentTemplateId ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <Award className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {certificateTemplates.find(t => t.id === currentTemplateId)?.name || "قالب الشهادة"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    معرف القالب: {currentTemplateId}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const template = certificateTemplates.find(t => t.id === currentTemplateId);
                    if (template) handlePreview(template);
                  }}
                  icon={<Eye className="w-4 h-4" />}
                >
                  معاينة
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRemove}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  icon={<Unlink2 className="w-4 h-4" />}
                >
                  إزالة
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">لا يوجد قالب شهادة معين</p>
              <p className="text-sm mt-1">اختر قالباً من القائمة أدناه لتعيينه للكورس</p>
            </div>
          )}
        </div>
        
        {/* Available Templates */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            القوالب المتاحة ({certificateTemplates.length})
          </h3>
          
          {isLoading && certificateTemplates.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : certificateTemplates.length === 0 ? (
            <EmptyState
              icon={<FileText className="w-12 h-12 text-gray-300" />}
              title="لا توجد قوالب شهادات"
              description="لا توجد قوالب شهادات متاحة في النظام حالياً"
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {certificateTemplates.map(template => (
                <CertificateTemplateCard
                  key={template.id}
                  template={template}
                  isAssigned={currentTemplateId === template.id}
                  onAssign={handleAssign}
                  onPreview={handlePreview}
                  disabled={hasCertificate && currentTemplateId !== template.id}
                />
              ))}
            </div>
          )}
        </div>
      </Section>
      
      {/* Preview Modal */}
      {showPreview && currentTemplate && (
        <Modal 
          isOpen={!!showPreview} 
          onClose={() => { setShowPreview(null); setCurrentTemplate(null); }}
          title={`معاينة: ${currentTemplate.name}`}
          size="xl"
        >
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 min-h-[500px] max-h-[70vh] overflow-auto border border-gray-200 dark:border-gray-700">
            <div 
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentTemplate.templateHtml) }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

interface CertificateTemplateCardProps {
  template: CertificateTemplate;
  isAssigned: boolean;
  onAssign: (id: string) => void;
  onPreview: (template: CertificateTemplate) => void;
  disabled: boolean;
}

const CertificateTemplateCard: React.FC<CertificateTemplateCardProps> = ({
  template,
  isAssigned,
  onAssign,
  onPreview,
  disabled,
}) => (
  <Card className={`relative overflow-hidden transition-all ${isAssigned ? "ring-2 ring-primary-500" : ""}`}>
    {isAssigned && (
      <div className="absolute top-0 left-0 right-0 h-1 bg-primary-500" />
    )}
    
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <Award className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
            {template.isDefault && (
              <Badge variant="secondary" className="text-xs mt-1">افتراضي</Badge>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant={isAssigned ? "secondary" : "outline"}
          size="sm"
          className="flex-1"
          onClick={() => onAssign(template.id)}
          disabled={disabled || isAssigned}
        >
          {isAssigned ? (
            <>
              <CheckCircle className="w-4 h-4" />
              معين حالياً
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4" />
              تعيين
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPreview(template)}
          className="text-gray-500 hover:text-primary-600"
          aria-label="معاينة القالب"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </div>
    </div>
  </Card>
);