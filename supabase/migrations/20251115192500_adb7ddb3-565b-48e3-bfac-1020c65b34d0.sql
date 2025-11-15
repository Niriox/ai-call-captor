-- Create calls table for AI voicemail call history
CREATE TABLE public.calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  customer_name TEXT,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_address TEXT,
  service_needed TEXT,
  preferred_time TIMESTAMP WITH TIME ZONE,
  urgency TEXT,
  call_duration_seconds INTEGER DEFAULT 0,
  call_status TEXT NOT NULL DEFAULT 'in_progress',
  call_transcript JSONB,
  call_recording_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their business calls" 
ON public.calls 
FOR SELECT 
USING (
  business_id IN (
    SELECT id FROM public.businesses WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create calls for their business" 
ON public.calls 
FOR INSERT 
WITH CHECK (
  business_id IN (
    SELECT id FROM public.businesses WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their business calls" 
ON public.calls 
FOR UPDATE 
USING (
  business_id IN (
    SELECT id FROM public.businesses WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their business calls" 
ON public.calls 
FOR DELETE 
USING (
  business_id IN (
    SELECT id FROM public.businesses WHERE user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_calls_updated_at
BEFORE UPDATE ON public.calls
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_calls_business_id ON public.calls(business_id);
CREATE INDEX idx_calls_created_at ON public.calls(created_at DESC);
CREATE INDEX idx_calls_status ON public.calls(call_status);