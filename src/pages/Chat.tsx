import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, X, Plus, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  category_type: string;
}

export default function Chat() {
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const { toast } = useToast();

  // Kategorien laden
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_categories')
        .select('*')
        .order('category_type', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Fehler",
        description: "Kategorien konnten nicht geladen werden.",
        variant: "destructive",
      });
    }
  };

  const addNewCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      setIsAddingCategory(true);
      const { data, error } = await supabase
        .from('chat_categories')
        .insert([{ name: newCategory.trim(), category_type: 'custom' }])
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => [...prev, data]);
      setNewCategory("");
      toast({
        title: "Erfolg",
        description: "Neue Kategorie wurde hinzugefügt.",
      });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Fehler", 
        description: "Kategorie konnte nicht hinzugefügt werden.",
        variant: "destructive",
      });
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie eine Nachricht ein.",
        variant: "destructive",
      });
      return;
    }

    if (selectedOptions.length === 0) {
      toast({
        title: "Fehler", 
        description: "Bitte wählen Sie mindestens eine Kategorie aus.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Daten in Supabase speichern
      const { error: supabaseError } = await supabase
        .from('chat_inputs')
        .insert([{
          message: message.trim(),
          selected_options: selectedOptions
        }]);

      if (supabaseError) throw supabaseError;

      // Daten an n8n Webhook senden
      try {
        await fetch('https://n8n.stoked-ai.com/webhook-test/1c39cab7-2d7f-49c0-97b3-9769aa0934a1', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: message.trim(),
            selected_options: selectedOptions,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
        // Webhook-Fehler soll nicht das gesamte Submit blockieren
      }

      toast({
        title: "Erfolgreich gesendet!",
        description: "Ihre Nachricht wurde erfolgreich übermittelt.",
      });

      // Formular zurücksetzen
      setMessage("");
      setSelectedOptions([]);

    } catch (error) {
      console.error('Error submitting:', error);
      toast({
        title: "Fehler",
        description: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleOption = (optionName: string) => {
    setSelectedOptions(prev => 
      prev.includes(optionName) 
        ? prev.filter(item => item !== optionName)
        : [...prev, optionName]
    );
  };

  const removeOption = (optionName: string) => {
    setSelectedOptions(prev => prev.filter(item => item !== optionName));
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Kategorien nach Typ gruppieren
  const groupedCategories = filteredCategories.reduce((acc, category) => {
    const type = category.category_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(category);
    return acc;
  }, {} as Record<string, Category[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 p-4">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <div className="relative z-10 max-w-2xl mx-auto space-y-6">
        <Card className="backdrop-blur-sm bg-card/80 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Chat Interface
              </CardTitle>
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Zurück
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nachricht Eingabe */}
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Ihre Nachricht
                </label>
                <Textarea
                  id="message"
                  placeholder="Geben Sie hier Ihre Nachricht ein..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px] resize-none"
                  disabled={isSubmitting}
                />
              </div>

              {/* Kategorien Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Kategorien auswählen
                </label>
                
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                      disabled={isSubmitting}
                    >
                      {selectedOptions.length > 0
                        ? `${selectedOptions.length} Kategorie(n) ausgewählt`
                        : "Kategorien auswählen..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput 
                        placeholder="Kategorien durchsuchen..." 
                        value={searchValue}
                        onValueChange={setSearchValue}
                      />
                      <CommandList>
                        <CommandEmpty>
                          <div className="p-4 space-y-2">
                            <p className="text-sm text-muted-foreground">Keine Kategorien gefunden.</p>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Neue Kategorie"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addNewCategory();
                                  }
                                }}
                              />
                              <Button
                                size="sm"
                                onClick={addNewCategory}
                                disabled={isAddingCategory || !newCategory.trim()}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CommandEmpty>

                        {Object.entries(groupedCategories).map(([type, typeCategories]) => (
                          <CommandGroup key={type} heading={type.charAt(0).toUpperCase() + type.slice(1)}>
                            {typeCategories.map((category) => (
                              <CommandItem
                                key={category.id}
                                onSelect={() => toggleOption(category.name)}
                                className="cursor-pointer"
                              >
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={selectedOptions.includes(category.name)}
                                    onCheckedChange={() => {}}
                                  />
                                  <span>{category.name}</span>
                                </div>
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    selectedOptions.includes(category.name) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        ))}

                        {/* Neue Kategorie hinzufügen Sektion */}
                        <CommandGroup heading="Neue Kategorie hinzufügen">
                          <div className="p-2 space-y-2">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Neue Kategorie"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addNewCategory();
                                  }
                                }}
                              />
                              <Button
                                size="sm"
                                onClick={addNewCategory}
                                disabled={isAddingCategory || !newCategory.trim()}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Ausgewählte Kategorien anzeigen */}
                {selectedOptions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedOptions.map((option) => (
                      <Badge
                        key={option}
                        variant="secondary"
                        className="gap-1"
                      >
                        {option}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 hover:bg-transparent"
                          onClick={() => removeOption(option)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting || !message.trim() || selectedOptions.length === 0}
              >
                {isSubmitting ? "Wird gesendet..." : "Absenden"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}