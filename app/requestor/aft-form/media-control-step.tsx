import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Disc, HardDrive } from 'lucide-react';

interface FormData {
  mediaControlNumber: string;
  mediaType: 'CD-R' | 'DVD-R' | 'DVD-RDL' | 'SSD' | 'SSD-T' | '';
}

interface MediaControlStepProps {
  data: FormData;
  updateData: (data: Partial<FormData>) => void;
}

export function MediaControlStep({ data, updateData }: MediaControlStepProps) {
  const handleInputChange = (field: keyof FormData, value: string) => {
    updateData({ [field]: value });
  };

  const getMediaIcon = () => {
    if (data.mediaType === 'SSD' || data.mediaType === 'SSD-T') {
      return <HardDrive className="w-5 h-5" />;
    }
    return <Disc className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            {getMediaIcon()}
            Section I: Media Control Number and Media Type
          </CardTitle>
          <CardDescription>
            Specify the media control number and select the type of media being used for this transfer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="mediaControlNumber">Media Control Number *</Label>
            <Input
              id="mediaControlNumber"
              type="text"
              placeholder="Enter media control number"
              value={data.mediaControlNumber}
              onChange={(e) => handleInputChange('mediaControlNumber', e.target.value)}
              required
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Unique identifier for tracking this physical media
            </p>
          </div>

          <div>
            <Label htmlFor="mediaType">Media Type *</Label>
            <Select
              value={data.mediaType}
              onValueChange={(value) => handleInputChange('mediaType', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select media type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CD-R">
                  <div className="flex items-center gap-2">
                    <Disc className="w-4 h-4" />
                    CD-R (Compact Disc Recordable)
                  </div>
                </SelectItem>
                <SelectItem value="DVD-R">
                  <div className="flex items-center gap-2">
                    <Disc className="w-4 h-4" />
                    DVD-R (DVD Recordable)
                  </div>
                </SelectItem>
                <SelectItem value="DVD-RDL">
                  <div className="flex items-center gap-2">
                    <Disc className="w-4 h-4" />
                    DVD-RDL (DVD Recordable Dual Layer)
                  </div>
                </SelectItem>
                <SelectItem value="SSD">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4" />
                    SSD (Solid State Drive)
                  </div>
                </SelectItem>
                <SelectItem value="SSD-T">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4" />
                    SSD-T (Solid State Drive - Trusted)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Select the physical media type that will be used for this transfer
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <h4 className="font-medium text-primary mb-2">Media Control Guidelines</h4>
        <ul className="text-sm text-primary/80 space-y-1">
          <li>• Media control numbers must be unique and traceable throughout the transfer process</li>
          <li>• Optical media (CD-R, DVD-R, DVD-RDL) requires destruction after transfer</li>
          <li>• SSD media requires sanitization after transfer completion</li>
          <li>• SSD-T (Trusted) provides additional security features for classified transfers</li>
        </ul>
      </div>
    </div>
  );
}