import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Phone, PhoneOff, Search, Eye, Clock, Calendar, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Calls = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [calls, setCalls] = useState<any[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("30");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    totalCalls: 0,
    avgDuration: "0:00",
    appointmentsBooked: 0,
  });

  useEffect(() => {
    loadBusinessAndCalls();
  }, []);

  useEffect(() => {
    if (businessId) {
      // Set up realtime subscription for new calls
      const channel = supabase
        .channel('calls-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'calls',
            filter: `business_id=eq.${businessId}`,
          },
          (payload) => {
            console.log('New call received:', payload);
            setCalls(prev => [payload.new, ...prev]);
            toast({
              title: "New call received",
              description: `Call from ${payload.new.customer_name || payload.new.customer_phone}`,
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [businessId]);

  useEffect(() => {
    filterCalls();
    calculateStats();
  }, [calls, searchQuery, dateRange, statusFilter]);

  const loadBusinessAndCalls = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/signin");
        return;
      }

      // Get business ID
      const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!business) {
        toast({
          title: "Error",
          description: "Business not found",
          variant: "destructive",
        });
        return;
      }

      setBusinessId(business.id);

      // Load calls
      const { data: callsData, error } = await supabase
        .from("calls")
        .select("*")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setCalls(callsData || []);
    } catch (error: any) {
      console.error("Error loading calls:", error);
      toast({
        title: "Error",
        description: "Failed to load call history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCalls = () => {
    let filtered = [...calls];

    // Date range filter
    if (dateRange !== "all") {
      const days = parseInt(dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      filtered = filtered.filter(call => new Date(call.created_at) >= cutoffDate);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(call => call.call_status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(call =>
        call.customer_name?.toLowerCase().includes(query) ||
        call.customer_phone?.toLowerCase().includes(query)
      );
    }

    setFilteredCalls(filtered);
  };

  const calculateStats = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCalls = calls.filter(call => new Date(call.created_at) >= thirtyDaysAgo);

    const totalCalls = recentCalls.length;
    const totalDuration = recentCalls.reduce((sum, call) => sum + (call.call_duration_seconds || 0), 0);
    const avgSeconds = totalCalls > 0 ? totalDuration / totalCalls : 0;
    const avgMinutes = Math.floor(avgSeconds / 60);
    const avgSecs = Math.floor(avgSeconds % 60);
    
    const appointmentsBooked = recentCalls.filter(call => 
      call.preferred_time || call.service_needed
    ).length;

    setStats({
      totalCalls,
      avgDuration: `${avgMinutes}:${avgSecs.toString().padStart(2, '0')}`,
      appointmentsBooked,
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading call history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </Button>
        </div>

        <h1 className="text-4xl font-bold mb-8">Call History</h1>

        {/* Filters */}
        <Card className="mb-6 shadow-elegant">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Calls</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="missed">Missed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card className="shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Calls This Month</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCalls}</div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Call Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgDuration}</div>
              <p className="text-xs text-muted-foreground">minutes</p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Appointments Booked</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.appointmentsBooked}</div>
            </CardContent>
          </Card>
        </div>

        {/* Calls Table */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Recent Calls</CardTitle>
            <CardDescription>View and manage your call history</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredCalls.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Service Needed</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCalls.map((call) => (
                    <TableRow key={call.id} className="cursor-pointer hover:bg-secondary/50">
                      <TableCell>
                        {new Date(call.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {call.customer_name || "Unknown"}
                      </TableCell>
                      <TableCell>
                        <a href={`tel:${call.customer_phone}`} className="text-primary hover:underline">
                          {formatPhoneNumber(call.customer_phone)}
                        </a>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate">
                          {call.service_needed || "—"}
                        </div>
                      </TableCell>
                      <TableCell>{formatDuration(call.call_duration_seconds)}</TableCell>
                      <TableCell>{getStatusBadge(call.call_status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/dashboard/calls/${call.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <PhoneOff className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No calls yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  When customers call and you can't answer, your AI will handle it and calls will appear here
                </p>
                <Button onClick={() => navigate("/dashboard/settings")}>
                  Test Your Setup
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calls;
