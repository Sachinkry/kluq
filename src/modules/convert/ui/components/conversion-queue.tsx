"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Video, 
  FileText, 
  Download, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Play,
  Pause,
  RotateCcw,
  Crown
} from "lucide-react"

interface ConversionItem {
  id: string;
  type: 'url' | 'file';
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  url?: string;
}

interface ConversionQueueProps {
  conversions: ConversionItem[]
  onStartConversion: (id: string) => void
  onRemoveConversion: (id: string) => void
  onConvertAll: () => void
  isPremium?: boolean
}

export const ConversionQueue = ({ 
  conversions, 
  onStartConversion, 
  onRemoveConversion, 
  onConvertAll,
  isPremium = false
}: ConversionQueueProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-muted-foreground" />;
      case 'processing': return <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'processing': return 'Processing';
      case 'completed': return 'Completed';
      case 'error': return 'Error';
      default: return '';
    }
  };

  if (conversions.length === 0) return null;

  const pendingConversions = conversions.filter(conv => conv.status === 'pending');
  const hasProcessing = conversions.some(conv => conv.status === 'processing');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Conversion Queue</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              onClick={onConvertAll}
              size="sm"
              disabled={!isPremium || pendingConversions.length === 0 || hasProcessing}
            >
              <span className="hidden sm:inline">Convert All</span>
              <span className="sm:hidden">All</span>
              {!isPremium && (
                <Crown className="w-3 h-3 ml-1" />
              )}
            </Button>
          </div>
        </div>
        {!isPremium && hasProcessing && (
          <p className="text-xs text-muted-foreground">
            Free tier can only process one conversion at a time. Upgrade to Premium for batch processing.
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {conversions.map((conversion) => (
            <div key={conversion.id} className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2">
                {getStatusIcon(conversion.status)}
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {getStatusText(conversion.status)}
                </span>
              </div>
              
              <div className="flex-shrink-0">
                {conversion.type === 'url' ? 
                  <Video className="w-5 h-5 text-red-500" /> : 
                  <FileText className="w-5 h-5 text-blue-500" />
                }
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-sm font-medium truncate">{conversion.name}</p>
                </div>
                {conversion.status === 'processing' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Converting...</span>
                      <span>{Math.round(conversion.progress)}%</span>
                    </div>
                    <Progress value={conversion.progress} className="h-2" />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {conversion.status === 'pending' && (
                  <Button
                    onClick={() => onStartConversion(conversion.id)}
                    disabled={!isPremium && hasProcessing}
                    size="sm"
                    variant="default"
                    className="hidden sm:flex"
                  >
                    Convert
                  </Button>
                )}
                
                {conversion.status === 'pending' && (
                  <Button
                    onClick={() => onStartConversion(conversion.id)}
                    disabled={!isPremium && hasProcessing}
                    size="sm"
                    variant="outline"
                    className="sm:hidden"
                  >
                    <Play className="w-3 h-3" />
                  </Button>
                )}
                
                {conversion.status === 'completed' && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-green-600 border-green-600 hover:bg-green-50 hidden sm:flex"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                )}
                
                {conversion.status === 'completed' && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-green-600 border-green-600 hover:bg-green-50 sm:hidden"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                )}
                
                {conversion.status === 'error' && (
                  <Button
                    onClick={() => onStartConversion(conversion.id)}
                    disabled={!isPremium && hasProcessing}
                    size="sm"
                    variant="outline"
                    className="hidden sm:flex"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Retry
                  </Button>
                )}
                
                {conversion.status === 'error' && (
                  <Button
                    onClick={() => onStartConversion(conversion.id)}
                    disabled={!isPremium && hasProcessing}
                    size="sm"
                    variant="outline"
                    className="sm:hidden"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                )}
                
                <Button
                  onClick={() => onRemoveConversion(conversion.id)}
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 