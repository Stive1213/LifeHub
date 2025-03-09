import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import { 
  Plus, 
  Search, 
  FileText, 
  Filter,
  Upload,
  FolderOpen,
  File,
  FileImage,
  File as FilePdf, // Use File as a replacement for FilePdf
  File as FileSpreadsheet, // Use File as a replacement for FileSpreadsheet
  Clock,
  Tag,
  Trash2,
  Download,
  Share
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Document as DocumentType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function Documents() {
  const [isAddDocumentDialogOpen, setIsAddDocumentDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  const [newDocument, setNewDocument] = useState({
    name: '',
    file: null as File | null,
    tags: '',
    type: ''
  });
  
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const { data: documents = [] } = useQuery<DocumentType[]>({
    queryKey: ['/api/documents'],
  });

  const createDocumentMutation = useMutation({
    mutationFn: async (documentData: { name: string; fileContent: string; type?: string; tags?: string[] }) => {
      return await apiRequest('POST', '/api/documents', documentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      setNewDocument({
        name: '',
        file: null,
        tags: '',
        type: ''
      });
      setFilePreview(null);
      setIsAddDocumentDialogOpen(false);
    }
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/documents/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewDocument({
        ...newDocument,
        file,
        name: file.name,
        type: file.type
      });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddDocument = () => {
    if (newDocument.file && newDocument.name.trim()) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileContent = event.target?.result as string;
        
        const tags = newDocument.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);
        
        createDocumentMutation.mutate({
          name: newDocument.name,
          fileContent,
          type: newDocument.type || undefined,
          tags: tags.length > 0 ? tags : undefined
        });
      };
      reader.readAsDataURL(newDocument.file);
    }
  };

  // Filter documents
  const filteredDocuments = documents.filter(document => {
    // Filter by search query
    if (searchQuery && !document.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by tag
    if (tagFilter && (!document.tags || !document.tags.includes(tagFilter))) {
      return false;
    }
    
    // Filter by type
    if (typeFilter && document.type !== typeFilter) {
      return false;
    }
    
    return true;
  });

  // Get unique tags and types for filters
  const tags = Array.from(
    new Set(
      documents
        .flatMap(doc => doc.tags || [])
        .filter(Boolean)
    )
  ) as string[];
  
  const types = Array.from(
    new Set(
      documents
        .map(doc => doc.type)
        .filter(Boolean)
    )
  ) as string[];

  // Get document icon based on type
  const getDocumentIcon = (type: string | undefined) => {
    if (!type) return <File className="h-10 w-10 text-neutral-500" />;
    
    if (type.includes('image')) {
      return <FileImage className="h-10 w-10 text-blue-500" />;
    } else if (type.includes('pdf')) {
      return <FilePdf className="h-10 w-10 text-red-500" />;
    } else if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) {
      return <FileSpreadsheet className="h-10 w-10 text-green-500" />;
    } else {
      return <FileText className="h-10 w-10 text-amber-500" />;
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Documents</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Securely store and organize your important files
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            onClick={() => setIsAddDocumentDialogOpen(true)}
            className="inline-flex items-center"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="md:col-span-3">
          <CardHeader className="pb-3 flex flex-col md:flex-row justify-between items-start md:items-center">
            <CardTitle>Document Library</CardTitle>
            <div className="flex items-center space-x-2 mt-3 md:mt-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                <Input
                  placeholder="Search documents..."
                  className="pl-8 w-[200px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All Documents</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="shared">Shared</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                {filteredDocuments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDocuments.map(document => (
                      <div
                        key={document.id}
                        className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >
                        <div className="flex items-center justify-center mb-3">
                          {getDocumentIcon(document.type)}
                        </div>
                        <div className="text-center mb-2">
                          <h3 className="font-medium truncate" title={document.name}>
                            {document.name}
                          </h3>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {format(new Date(document.uploadDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                        {document.tags && document.tags.length > 0 && (
                          <div className="flex flex-wrap justify-center gap-1 mb-3">
                            {document.tags.map(tag => (
                              <span 
                                key={tag} 
                                className="px-2 py-0.5 rounded-full text-xs bg-neutral-100 dark:bg-neutral-800"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTagFilter(tag);
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex justify-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-500 hover:text-red-600"
                            onClick={() => deleteDocumentMutation.mutate(document.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-neutral-500 dark:text-neutral-400">
                    {searchQuery || tagFilter || typeFilter
                      ? "No documents match your filters"
                      : "No documents yet. Click 'Upload Document' to add one."}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="recent" className="mt-4">
                {filteredDocuments.length > 0 ? (
                  <div className="space-y-2">
                    {[...filteredDocuments]
                      .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
                      .slice(0, 10)
                      .map(document => (
                        <div
                          key={document.id}
                          className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <div className="mr-3">
                              {getDocumentIcon(document.type)}
                            </div>
                            <div>
                              <h3 className="font-medium">{document.name}</h3>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {format(new Date(document.uploadDate), 'MMM d, yyyy • h:mm a')}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500 hover:text-red-600"
                              onClick={() => deleteDocumentMutation.mutate(document.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-neutral-500 dark:text-neutral-400">
                    No recent documents
                  </div>
                )}
              </TabsContent>
              <TabsContent value="shared" className="mt-4">
                <div className="text-center py-10 text-neutral-500 dark:text-neutral-400">
                  Shared documents feature coming soon
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FolderOpen className="h-5 w-5 mr-2" />
                Document Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div 
                  className={`px-3 py-2 rounded-md cursor-pointer ${typeFilter === null ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                  onClick={() => setTypeFilter(null)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">All Types</span>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">{documents.length}</span>
                  </div>
                </div>
                {types.map(type => (
                  <div 
                    key={type}
                    className={`px-3 py-2 rounded-md cursor-pointer ${typeFilter === type ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                    onClick={() => setTypeFilter(type)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getDocumentIcon(type)}
                        <span className="font-medium ml-2">{type.split('/')[1]?.toUpperCase() || type}</span>
                      </div>
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        {documents.filter(d => d.type === type).length}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div 
                  className={`px-3 py-2 rounded-md cursor-pointer ${tagFilter === null ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                  onClick={() => setTagFilter(null)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">All Tags</span>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">{documents.length}</span>
                  </div>
                </div>
                {tags.map(tag => (
                  <div 
                    key={tag}
                    className={`px-3 py-2 rounded-md cursor-pointer ${tagFilter === tag ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                    onClick={() => setTagFilter(tag)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{tag}</span>
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        {documents.filter(d => d.tags?.includes(tag)).length}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isAddDocumentDialogOpen} onOpenChange={setIsAddDocumentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Add a new document to your secure vault.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-md p-6 text-center">
              {filePreview ? (
                <div className="space-y-2">
                  <div className="flex justify-center">
                    {getDocumentIcon(newDocument.type)}
                  </div>
                  <p className="text-sm font-medium">{newDocument.file?.name}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {newDocument.file?.size ? `${(newDocument.file.size / 1024).toFixed(2)} KB` : ''}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setNewDocument({...newDocument, file: null});
                      setFilePreview(null);
                    }}
                  >
                    Change File
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-center">
                    <Upload className="h-10 w-10 text-neutral-400" />
                  </div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Drag and drop a file, or click to browse
                  </p>
                  <Input
                    id="document-file"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('document-file')?.click()}
                  >
                    Browse Files
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="document-name">Document Name</Label>
              <Input
                id="document-name"
                value={newDocument.name}
                onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                placeholder="Enter document name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="document-tags">Tags (comma separated)</Label>
              <Input
                id="document-tags"
                value={newDocument.tags}
                onChange={(e) => setNewDocument({ ...newDocument, tags: e.target.value })}
                placeholder="e.g., invoice, tax, important"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDocumentDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddDocument}
              disabled={!newDocument.file || !newDocument.name.trim() || createDocumentMutation.isPending}
            >
              {createDocumentMutation.isPending ? 'Uploading...' : 'Upload Document'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
