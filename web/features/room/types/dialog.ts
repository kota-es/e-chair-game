type NoticeDialogData = {
  title: string;
  message: string;
  button: {
    label: string;
    action: () => void;
  };
};
export type ShowNoticeModalFn = (
  data: NoticeDialogData,
  miliseconds?: number
) => void;
