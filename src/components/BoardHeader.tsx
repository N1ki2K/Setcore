import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users } from "lucide-react";
import { useState } from "react";

interface BoardHeaderProps {
  title: string;
  onAddList: () => void;
}

const BoardHeader = ({ title, onAddList }: BoardHeaderProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Users className="w-4 h-4 mr-2" />
            Team
          </Button>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <Button onClick={onAddList} className="shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Add List
          </Button>
        </div>
      </div>
    </header>
  );
};

export default BoardHeader;