-- Create enterprise_inquiries table
CREATE TABLE public.enterprise_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company_name TEXT NOT NULL,
  num_locations TEXT NOT NULL,
  estimated_calls TEXT NOT NULL,
  current_solution TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.enterprise_inquiries ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert inquiries
CREATE POLICY "Anyone can submit enterprise inquiry" 
ON public.enterprise_inquiries 
FOR INSERT 
WITH CHECK (true);

-- Create policy for viewing inquiries (only for authenticated users who are admins)
-- For now, we'll just allow insert, and viewing can be done via database directly
CREATE POLICY "Only admins can view inquiries"
ON public.enterprise_inquiries
FOR SELECT
USING (false);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_enterprise_inquiries_updated_at
BEFORE UPDATE ON public.enterprise_inquiries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_enterprise_inquiries_created_at ON public.enterprise_inquiries(created_at DESC);
CREATE INDEX idx_enterprise_inquiries_status ON public.enterprise_inquiries(status);