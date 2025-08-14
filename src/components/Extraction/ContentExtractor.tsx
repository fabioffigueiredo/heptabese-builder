import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Video, 
  Globe, 
  Upload, 
  Download, 
  Sparkles, 
  BookOpen,
  Link,
  Play,
  FileImage
} from "lucide-react";
import { toast } from "sonner";
import { EnhancedCardData } from "@/types/heptabase";

interface ContentExtractorProps {
  onCardCreate: (card: Partial<EnhancedCardData>) => void;
}

export default function ContentExtractor({ onCardCreate }: ContentExtractorProps) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);
  const [url, setUrl] = useState("");
  const [extractedContent, setExtractedContent] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Simulate content extraction from different sources
  const extractFromURL = async (sourceUrl: string, type: 'video' | 'article' | 'pdf') => {
    setIsExtracting(true);
    setExtractProgress(0);
    
    try {
      // Simulate extraction process
      for (let i = 0; i <= 100; i += 10) {
        setExtractProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Mock extracted content based on type
      let mockContent = "";
      let mockTitle = "";
      let mockTags: string[] = [];
      
      switch (type) {
        case 'video':
          mockTitle = "Video: Understanding Concepts";
          mockContent = `**Key Points from Video:**

• Main concept: [Extracted concept]
• Supporting arguments: [Key arguments]
• Examples mentioned: [Important examples]
• Conclusion: [Main takeaway]

**Timestamps:**
- 0:00 - Introduction
- 2:30 - Core concept explanation
- 5:45 - Examples and applications
- 8:20 - Summary and conclusion

**Notes:**
Add your thoughts and connections here...`;
          mockTags = ["video", "learning", "concepts"];
          break;
          
        case 'article':
          mockTitle = "Article: Key Insights";
          mockContent = `**Article Summary:**

**Main Points:**
1. [First key point]
2. [Second key point]
3. [Third key point]

**Important Quotes:**
> "[Significant quote from the article]"

**Personal Reflections:**
- How does this connect to other knowledge?
- What questions does this raise?
- Potential applications?

**Follow-up Actions:**
- [ ] Research related topics
- [ ] Connect to existing cards
- [ ] Apply insights to current projects`;
          mockTags = ["article", "research", "insights"];
          break;
          
        case 'pdf':
          mockTitle = "Document: Research Notes";
          mockContent = `**Document Analysis:**

**Key Sections:**
- Chapter/Section 1: [Summary]
- Chapter/Section 2: [Summary]
- Chapter/Section 3: [Summary]

**Important Data/Statistics:**
- [Relevant data point 1]
- [Relevant data point 2]

**Methodologies Mentioned:**
- [Method 1]
- [Method 2]

**Questions for Further Research:**
1. [Question 1]
2. [Question 2]
3. [Question 3]`;
          mockTags = ["document", "research", "analysis"];
          break;
      }
      
      setExtractedContent(mockContent);
      setSuggestions([
        `Create cards for each main point`,
        `Link to related ${type} content`,
        `Add personal insights and connections`,
        `Create follow-up action items`
      ]);
      
      toast.success(`Content extracted from ${type}!`);
      
    } catch (error) {
      toast.error("Failed to extract content");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const fileType = file.type;
    if (fileType.includes('pdf')) {
      extractFromURL(URL.createObjectURL(file), 'pdf');
    } else if (fileType.includes('video')) {
      extractFromURL(URL.createObjectURL(file), 'video');
    } else {
      toast.error("Unsupported file type");
    }
  };

  const createCardFromExtraction = () => {
    if (!extractedContent) return;
    
    const newCard: Partial<EnhancedCardData> = {
      title: "Extracted Content",
      content: extractedContent,
      tags: ["extracted", "content"],
      properties: {
        dateCreated: new Date(),
        dateModified: new Date(),
        source: url,
        category: "research"
      },
      position: { 
        x: Math.random() * 300 + 150, 
        y: Math.random() * 200 + 150 
      }
    };
    
    onCardCreate(newCard);
    toast.success("Card created from extracted content!");
    
    // Reset
    setExtractedContent("");
    setUrl("");
    setSuggestions([]);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-2">Content Extraction</h2>
        <p className="text-sm text-muted-foreground">
          Extract knowledge from videos, articles, and documents
        </p>
      </div>

      <div className="flex-1 p-4">
        <Tabs defaultValue="url" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              URL
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4">
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter URL (YouTube, article, PDF link...)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => {
                      if (url.includes('youtube') || url.includes('youtu.be')) {
                        extractFromURL(url, 'video');
                      } else if (url.includes('.pdf')) {
                        extractFromURL(url, 'pdf');
                      } else {
                        extractFromURL(url, 'article');
                      }
                    }}
                    disabled={!url || isExtracting}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Extract
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => extractFromURL("https://youtube.com/watch?v=example", 'video')}
                    disabled={isExtracting}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Video Demo
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => extractFromURL("https://example.com/article", 'article')}
                    disabled={isExtracting}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Article Demo
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => extractFromURL("https://example.com/document.pdf", 'pdf')}
                    disabled={isExtracting}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    PDF Demo
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <Card className="p-4">
              <div className="space-y-3">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept=".pdf,.mp4,.mov,.avi"
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload PDF, video, or document
                    </p>
                  </label>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <Card className="p-4">
              <div className="space-y-3">
                <Textarea
                  placeholder="Paste content here to process into structured cards..."
                  value={extractedContent}
                  onChange={(e) => setExtractedContent(e.target.value)}
                  className="min-h-32"
                />
                <Button 
                  onClick={() => {
                    setSuggestions([
                      "Break content into smaller cards",
                      "Add relevant tags",
                      "Create connections to existing knowledge",
                      "Add personal insights"
                    ]);
                  }}
                  disabled={!extractedContent}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Process Content
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Extraction Progress */}
        {isExtracting && (
          <Card className="p-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Extracting content...</span>
                <span className="text-sm text-muted-foreground">{extractProgress}%</span>
              </div>
              <Progress value={extractProgress} />
            </div>
          </Card>
        )}

        {/* Extracted Content Preview */}
        {extractedContent && (
          <Card className="p-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Extracted Content</h3>
                <Button size="sm" onClick={createCardFromExtraction}>
                  <Download className="h-4 w-4 mr-2" />
                  Create Card
                </Button>
              </div>
              
              <Textarea
                value={extractedContent}
                onChange={(e) => setExtractedContent(e.target.value)}
                className="min-h-40"
              />
              
              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Suggestions:</h4>
                  <div className="space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-1">
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}