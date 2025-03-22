"use client";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
const ToastProvider = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<div ref={ref} className={cn("fixed bottom-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]", className)} {...props}/>);
});
ToastProvider.displayName = "ToastProvider";
const Toast = React.forwardRef((_a, ref) => {
    var { className, variant = "default", onClose } = _a, props = __rest(_a, ["className", "variant", "onClose"]);
    return (<div ref={ref} className={cn("group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full", variant === "default" &&
            "bg-background text-foreground", variant === "destructive" &&
            "destructive group border-destructive bg-destructive text-destructive-foreground", className)} {...props}>
      {onClose && (<button type="button" onClick={onClose} className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100">
          <X className="h-4 w-4"/>
          <span className="sr-only">Close</span>
        </button>)}
    </div>);
});
Toast.displayName = "Toast";
const ToastTitle = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<h3 ref={ref} className={cn("text-sm font-medium", className)} {...props}/>);
});
ToastTitle.displayName = "ToastTitle";
const ToastDescription = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<p ref={ref} className={cn("text-sm opacity-90", className)} {...props}/>);
});
ToastDescription.displayName = "ToastDescription";
const ToastAction = React.forwardRef((_a, ref) => {
    var { className, altText } = _a, props = __rest(_a, ["className", "altText"]);
    return (<button ref={ref} className={cn("inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive", className)} {...props}>
    {altText && <span className="sr-only">{altText}</span>}
  </button>);
});
ToastAction.displayName = "ToastAction";
export { ToastProvider, Toast, ToastTitle, ToastDescription, ToastAction, };
