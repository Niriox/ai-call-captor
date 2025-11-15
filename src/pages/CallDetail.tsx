import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Download,
  Calendar,
  MessageSquare,
  AlertCircle,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CallDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [call, setCall] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadCallDetails();
    }
  }, [id]);

  const loadCallDetails = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/signin");
        return;
      }

      const { data, error } = await supabase
        .from("calls")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setCall(data);
    } catch (error: any) {
      console.error("Error loading call details:", error);
      toast({
        title: "Error",
        description: "Failed to load call details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} minutes ${secs} seconds`;
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive", text: string }> = {
      completed: { variant: "default", text: "Completed" },
      missed: { variant: "destructive", text: "Missed" },
      in_progress: { variant: "secondary", text: "In Progress" },
    };
    const config = variants[status] || variants.completed;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getUrgencyBadge = (urgency: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive", text: string }> = {
      emergency: { variant: "destructive", text: "Emergency" },
      asap: { variant: "default", text: "ASAP" },
      flexible: { variant: "secondary", text: "Flexible" },
    };
    const config = variants[urgency?.toLowerCase()] || variants.flexible;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const handleSendSMS = () => {
    toast({
      title: "Coming soon",
      description: "SMS functionality will be available soon",
    });
  };

  const handleAddToCalendar = () => {
    toast({
      title: "Coming soon",
      description: "Calendar integration will be available soon",
    });
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(call, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `call-${id}.json`;
    link.click();
  };

  const handleReport = () => {
    toast({
      title: "Coming soon",
      description: "Issue reporting will be available soon",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading call details...</p>
        </div>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Call not found</h2>
            <p className="text-muted-foreground mb-4">This call does not exist or you don't have access to it.</p>
            <Button onClick={() => navigate("/dashboard/calls")}>
              ← Back to Calls
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/dashboard/calls")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Calls
          </Button>
        </div>

        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold">Call Details</h1>
            {getStatusBadge(call.call_status)}
          </div>

          {/* Call Info Card */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Call Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-medium">
                      {new Date(call.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })} at {new Date(call.created_at).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{formatDuration(call.call_duration_seconds)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info Card */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary font-semibold">
                      {call.customer_name?.charAt(0) || "?"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium text-lg">{call.customer_name || "Unknown"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{formatPhoneNumber(call.customer_phone)}</p>
                  </div>
                  <Button size="sm" asChild>
                    <a href={`tel:${call.customer_phone}`}>
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </a>
                  </Button>
                </div>

                {call.customer_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{call.customer_email}</p>
                    </div>
                  </div>
                )}

                {call.customer_address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{call.customer_address}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Service Request Card */}
          {call.service_needed && (
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Service Request</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Service Needed</p>
                  <p className="font-medium">{call.service_needed}</p>
                </div>

                {call.urgency && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Urgency</p>
                    {getUrgencyBadge(call.urgency)}
                  </div>
                )}

                {call.preferred_time && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Preferred Time</p>
                      <p className="font-medium">
                        {new Date(call.preferred_time).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Call Transcript Card */}
          {call.call_transcript && (
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Conversation Transcript</CardTitle>
                <CardDescription>Full conversation log</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {Array.isArray(call.call_transcript) ? (
                    call.call_transcript.map((message: any, index: number) => (
                      <div key={index} className={`flex gap-3 ${message.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'ai' ? 'bg-secondary' : 'bg-primary text-primary-foreground'
                        }`}>
                          <p className="text-xs opacity-70 mb-1">
                            {message.role === 'ai' ? 'AI Assistant' : 'Customer'} • {message.timestamp && new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                          <p>{message.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No transcript available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Call Recording Card */}
          {call.call_recording_url && (
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Call Recording</CardTitle>
                <CardDescription>Recording stored for 90 days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <audio controls className="w-full">
                  <source src={call.call_recording_url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
                <Button variant="outline" size="sm" asChild>
                  <a href={call.call_recording_url} download>
                    <Download className="w-4 h-4 mr-2" />
                    Download Recording
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Actions Card */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleSendSMS}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Follow-up SMS
                </Button>
                <Button variant="outline" onClick={handleAddToCalendar}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Add to Calendar
                </Button>
                <Button variant="outline" onClick={handleExport}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export Details
                </Button>
                <Button variant="outline" onClick={handleReport}>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Report Issue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CallDetail;
