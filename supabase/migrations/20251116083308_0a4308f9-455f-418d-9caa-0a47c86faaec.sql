-- Add twilio_number column to businesses table
ALTER TABLE public.businesses
ADD COLUMN twilio_number text;