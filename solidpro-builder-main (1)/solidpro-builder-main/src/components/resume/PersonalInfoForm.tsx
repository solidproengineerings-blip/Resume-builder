import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Linkedin, MapPin, X } from "lucide-react";

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  linkedin?: string;
  location?: string;
}

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
  showErrors?: boolean;
}

// Better global phone regex (international + formatting allowed)
const PHONE_REGEX =
  /^(\+?\d{1,3}[-\s]?)?(\(?\d{2,4}\)?[-\s]?)?[\d\s\-]{6,12}$/;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PersonalInfoForm({ data, onChange, showErrors = false }: PersonalInfoFormProps) {
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const validatePhone = (phone: string) => {
    const cleaned = phone.trim();

    if (!cleaned) {
      setPhoneError("Phone number is required");
      return false;
    }

    if (!PHONE_REGEX.test(cleaned)) {
      setPhoneError("Please enter a valid phone number");
      return false;
    }

    setPhoneError(null);
    return true;
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const hideToast = () => {
    setToastVisible(false);
  };

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    if (!EMAIL_REGEX.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleChange = (field: keyof PersonalInfo, value: string) => {
    if (field === "fullName" && value.length > 50) return;
    if (field === "phone" && value.length > 14) return;
    if (field === "location" && value.length > 25) return;

    const newData = { ...data, [field]: value };
    onChange(newData);

    if (field === "phone") {
      // Hide toast when user starts typing
      hideToast();

      setPhoneTouched(true);
      const valid = validatePhone(value);

      // Reset when phone becomes valid
      if (valid) {
        setPhoneError(null);
      }
    }

    if (field === "email" && emailTouched) {
      validateEmail(value);
    }
  };

  const handleBlur = (field: keyof PersonalInfo, value: string) => {
    if (field === "phone") {
      setPhoneTouched(true);
      const valid = validatePhone(value);

      // Show toast only on blur if invalid
      if (!valid && !toastVisible) {
        showToast(phoneError || "Invalid Phone Number");
      }
    }
    if (field === "email") {
      setEmailTouched(true);
      validateEmail(value);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Toast Notification */}
      {toastVisible && (
        <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <span className="font-medium">{toastMessage}</span>
          <button
            onClick={hideToast}
            className="hover:bg-red-700 rounded p-1 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Form Section */}
      <div className="space-y-6 bg-white rounded-lg border p-6 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Personal Information</h2>
          <p className="text-sm text-gray-600">
            Enter your contact details
          </p>
        </div>

        <div className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="fullName"
                placeholder="John Doe"
                value={data.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                className={`pl-10 ${showErrors && !data.fullName.trim() ? "border-red-500 focus:ring-red-500" : ""}`}
              />
            </div>
          </div>

          {/* Email and Phone Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </Label>
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={data.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    onBlur={(e) => handleBlur("email", e.target.value)}
                    className={`pl-10 ${(emailTouched && emailError) || (showErrors && (!data.email.trim() || emailError)) ? "border-red-500 focus:ring-red-500" : ""}`}
                  />
                </div>
                {((emailTouched && emailError) || (showErrors && emailError)) && (
                  <p className="text-sm text-red-500 mt-1">{emailError}</p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-1">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 flex-shrink-0" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={data.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    onBlur={(e) => handleBlur("phone", e.target.value)}
                    className={`pl-10 ${(phoneTouched && phoneError) || (showErrors && (!data.phone.trim() || phoneError)) ? "border-red-500 focus:ring-red-500" : ""
                      }`}
                  />
                </div>
                {((phoneTouched && phoneError) || (showErrors && phoneError)) && (
                  <p className="text-sm text-red-500 mt-1">{phoneError}</p>
                )}
              </div>
            </div>
          </div>

          {/* LinkedIn and Location Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* LinkedIn */}
            <div className="space-y-2">
              <Label htmlFor="linkedin" className="text-sm font-medium">
                LinkedIn
              </Label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="linkedin"
                  placeholder="linkedin.com/in/johndoe"
                  value={data.linkedin || ""}
                  onChange={(e) => handleChange("linkedin", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                Location
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  placeholder="New York, NY"
                  value={data.location || ""}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}