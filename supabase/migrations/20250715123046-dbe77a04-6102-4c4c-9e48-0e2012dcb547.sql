-- Create table for categories/playlist options
CREATE TABLE public.chat_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category_type TEXT NOT NULL DEFAULT 'genre', -- 'genre', 'mood', 'occasion', etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for chat inputs
CREATE TABLE public.chat_inputs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  selected_options TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chat_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_inputs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no authentication is mentioned)
CREATE POLICY "Allow public read access on chat_categories" 
ON public.chat_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access on chat_categories" 
ON public.chat_categories 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public read access on chat_inputs" 
ON public.chat_inputs 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access on chat_inputs" 
ON public.chat_inputs 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_chat_categories_updated_at
BEFORE UPDATE ON public.chat_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default categories
INSERT INTO public.chat_categories (name, category_type) VALUES
('Hip Hop', 'genre'),
('Electronic', 'genre'),
('Pop', 'genre'),
('Rock', 'genre'),
('Entspannt', 'mood'),
('Energetisch', 'mood'),
('Melancholisch', 'mood'),
('Party', 'occasion'),
('Workout', 'occasion'),
('Entspannung', 'occasion'),
('Arbeit', 'occasion');