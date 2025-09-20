import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToolTipButtonProps {
  content: string;
  trigger: React.ReactNode;
}
const TooltipButton: React.FC<ToolTipButtonProps> = ({ content, trigger }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent>{content}</TooltipContent>
    </Tooltip>
  );
};

export default TooltipButton;
