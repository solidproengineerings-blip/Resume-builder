import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormSection } from "./FormSection";
import { FormField } from "./FormField";
import { Certification } from "@/types/resume";
import { Plus, Trash2, Award, ChevronDown, ChevronUp } from "lucide-react";

interface CertificationsFormProps {
    certifications: Certification[];
    onChange: (certifications: Certification[]) => void;
}

export function CertificationsForm({ certifications, onChange }: CertificationsFormProps) {
    const [expandedIds, setExpandedIds] = useState<string[]>([]);

    const addCertification = () => {
        const newCert: Certification = {
            id: Date.now().toString(),
            name: "",
            issuer: "",
            year: "",
            link: "",
        };
        onChange([...certifications, newCert]);
        setExpandedIds([...expandedIds, newCert.id]);
    };

    const updateCertification = (id: string, field: keyof Certification, value: string) => {
        onChange(
            certifications.map((cert) =>
                cert.id === id ? { ...cert, [field]: value } : cert
            )
        );
    };

    const removeCertification = (id: string) => {
        onChange(certifications.filter((cert) => cert.id !== id));
        setExpandedIds(expandedIds.filter((eid) => eid !== id));
    };

    const toggleExpand = (id: string) => {
        setExpandedIds(
            expandedIds.includes(id)
                ? expandedIds.filter((eid) => eid !== id)
                : [...expandedIds, id]
        );
    };

    return (
        <FormSection
            title="Certifications"
            description="Add your professional certifications and licenses"
        >
            <div className="space-y-4">
                {certifications.map((cert, index) => (
                    <div
                        key={cert.id}
                        className="border-2 border-border rounded-xl p-4 bg-card transition-all hover:border-primary/30"
                    >
                        <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => toggleExpand(cert.id)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                    <Award className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold font-display">
                                        {cert.name || `Certification ${index + 1}`}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        {cert.issuer || "Issuer"} {cert.year && `| ${cert.year}`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeCertification(cert.id);
                                    }}
                                    className="text-muted-foreground hover:bg-red-500 hover:text-white "
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                {expandedIds.includes(cert.id) ? (
                                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                )}
                            </div>
                        </div>

                        {expandedIds.includes(cert.id) && (
                            <div className="mt-4 space-y-4 pt-4 border-t border-border">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField label="Certification Name" required>
                                        <Input
                                            placeholder="AWS Certified Solutions Architect"
                                            value={cert.name}
                                            onChange={(e) =>
                                                updateCertification(cert.id, "name", e.target.value)
                                            }
                                        />
                                    </FormField>
                                    <FormField label="Issuing Organization" required>
                                        <Input
                                            placeholder="Amazon Web Services"
                                            value={cert.issuer}
                                            onChange={(e) =>
                                                updateCertification(cert.id, "issuer", e.target.value)
                                            }
                                        />
                                    </FormField>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField label="Year" required>
                                        <Input
                                            placeholder="2023"
                                            value={cert.year}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === "" || (/^\d+$/.test(value) && value.length <= 4)) {
                                                    updateCertification(cert.id, "year", value);
                                                }
                                            }}
                                            maxLength={4}
                                        />
                                    </FormField>
                                    <FormField label="Credential Link (Optional)">
                                        <Input
                                            placeholder="https://..."
                                            value={cert.link || ""}
                                            onChange={(e) =>
                                                updateCertification(cert.id, "link", e.target.value)
                                            }
                                        />
                                    </FormField>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={addCertification}
                    className="w-full"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Certification
                </Button>
            </div>
        </FormSection>
    );
}
