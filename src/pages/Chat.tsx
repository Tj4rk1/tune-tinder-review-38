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
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Background with multiple gradients */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900" />
      <div className="fixed inset-0 bg-gradient-to-tr from-purple-900/30 via-transparent to-pink-900/30" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-400/20 via-transparent to-transparent" />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Chat Interface</h1>
              <Link to="/">
                <button className="text-white/70 hover:text-white transition-colors text-sm flex items-center justify-center mx-auto">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Zurück
                </button>
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Message Input */}
              <div className="space-y-3">
                <label className="text-white/90 text-sm font-medium block">
                  Ihre Nachricht
                </label>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                  <Textarea
                    placeholder="Geben Sie hier Ihre Nachricht ein..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-transparent border-none resize-none text-white placeholder:text-white/50 focus:ring-0 p-0 min-h-[100px]"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Categories Dropdown */}
              <div className="space-y-3">
                <label className="text-white/90 text-sm font-medium block">
                  Kategorien auswählen
                </label>
                
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-left text-white/90 hover:bg-white/20 transition-colors flex items-center justify-between"
                      disabled={isSubmitting}
                    >
                      {selectedOptions.length > 0
                        ? `${selectedOptions.length} Kategorie(n) ausgewählt`
                        : "Kategorien auswählen..."}
                      <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 bg-slate-900/95 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl">
                    <Command className="bg-transparent">
                      <CommandInput 
                        placeholder="Kategorien durchsuchen..." 
                        value={searchValue}
                        onValueChange={setSearchValue}
                        className="text-white placeholder:text-white/60 bg-white/10 border-white/20"
                      />
                      <CommandList>
                        <CommandEmpty>
                          <div className="p-4 space-y-2">
                            <p className="text-sm text-white/70">Keine Kategorien gefunden.</p>
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
                                className="bg-white/10 border-white/20 text-white"
                              />
                              <Button
                                size="sm"
                                onClick={addNewCategory}
                                disabled={isAddingCategory || !newCategory.trim()}
                                className="bg-blue-500 hover:bg-blue-600"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CommandEmpty>

                        {Object.entries(groupedCategories).map(([type, typeCategories]) => (
                          <CommandGroup key={type} heading={type.charAt(0).toUpperCase() + type.slice(1)} className="text-white/80">
                            {typeCategories.map((category) => (
                              <CommandItem
                                key={category.id}
                                onSelect={() => toggleOption(category.name)}
                                className="cursor-pointer text-white hover:bg-white/10"
                              >
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={selectedOptions.includes(category.name)}
                                    onCheckedChange={() => {}}
                                    className="border-white/30"
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

                        {/* New Category Section */}
                        <CommandGroup heading="Neue Kategorie hinzufügen" className="text-white/80">
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
                                className="bg-white/10 border-white/20 text-white"
                              />
                              <Button
                                size="sm"
                                onClick={addNewCategory}
                                disabled={isAddingCategory || !newCategory.trim()}
                                className="bg-blue-500 hover:bg-blue-600"
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

                {/* Selected Categories */}
                {selectedOptions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedOptions.map((option) => (
                      <div
                        key={option}
                        className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1 text-sm text-white flex items-center gap-2"
                      >
                        {option}
                        <button
                          type="button"
                          onClick={() => removeOption(option)}
                          className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !message.trim() || selectedOptions.length === 0}
                className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 disabled:from-gray-500 disabled:via-gray-500 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg"
              >
                {isSubmitting ? "Wird gesendet..." : "Absenden"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}