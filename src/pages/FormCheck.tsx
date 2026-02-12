import { useState } from "react";
import { motion } from "framer-motion";
import { Video, Upload, FileVideo, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FormCheck() {
  const [uploading, setUploading] = useState(false);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Form Check</h1>
        <p className="text-sm text-muted-foreground mt-1">Upload a video and get AI feedback on your exercise form</p>
      </motion.div>

      {/* Upload Area */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
              <Video className="h-8 w-8 text-accent-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-1">Upload Exercise Video</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Record yourself performing an exercise and our AI will analyze your form and provide detailed feedback
            </p>
            <Button className="gap-2" size="lg">
              <Upload className="h-4 w-4" />
              Choose Video
            </Button>
            <p className="text-xs text-muted-foreground mt-3">MP4, MOV, or WebM · Max 50MB</p>
          </div>
        </CardContent>
      </Card>

      {/* Past checks */}
      <div>
        <h2 className="font-display text-lg font-semibold mb-3">Previous Form Checks</h2>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center text-muted-foreground">
            <FileVideo className="mx-auto h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">No form checks yet. Upload your first video to get started!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
