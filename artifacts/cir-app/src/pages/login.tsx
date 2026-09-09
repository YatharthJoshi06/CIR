// import { useLocation } from "wouter";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { ShieldAlert, Lock } from "lucide-react";
// import { useLogin, getGetMeQueryKey } from "@workspace/api-client-react";
// import { useQueryClient } from "@tanstack/react-query";
// import { Button } from "@/component/ui/button";
// import { Input } from "@/component/ui/input";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/component/ui/form";
// import { useToast } from "@/hooks/use-toast";

// const loginSchema = z.object({
//   userId: z.string().min(1, "User ID is required"),
//   password: z.string().min(1, "Password is required"),
// });

// type LoginForm = z.infer<typeof loginSchema>;
// export default function Login() {
//   const [, setLocation] = useLocation();
//   const { toast } = useToast();
//   const queryClient = useQueryClient();
//   const loginMut = useLogin();

//   const form = useForm<LoginForm>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: { userId: "", password: "" },
//   });

//   const onSubmit = (data: LoginForm) => {
//     loginMut.mutate(
//   {
//     userId: data.userId,
//     password: data.password,
//   },
//   {
//       onSuccess: (officer) => {
//         queryClient.setQueryData(getGetMeQueryKey(), officer);
//         setLocation("/dashboard");
//       },
//       onError: () => {
//         toast({ variant: "destructive", title: "Authentication Failed", description: "Invalid credentials. Please try again." });
//       },
//     });
//   };

//   return (
//     <div className="min-h-screen bg-background flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4">
//             <ShieldAlert className="h-8 w-8 text-primary" />
//           </div>
//           <h1 className="text-2xl font-bold tracking-widest uppercase text-foreground">CIR INTEL</h1>
//           <p className="text-muted-foreground text-sm mt-1 uppercase tracking-widest">Crypto Intelligence Registry</p>
//         </div>

//         <div className="bg-card border border-border rounded-lg p-6">
//           <div className="flex items-center gap-2 mb-6">
//             <Lock className="h-4 w-4 text-primary" />
//             <span className="text-sm font-semibold uppercase tracking-widest text-foreground">Secure Access</span>
//           </div>

//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//               <FormField
//                 control={form.control}
//                 name="userId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Officer ID</FormLabel>
//                     <FormControl>
//                       <Input placeholder="Enter your officer ID" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="password"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Password</FormLabel>
//                     <FormControl>
//                       <Input type="password" placeholder="Enter your password" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <Button type="submit" className="w-full" disabled={loginMut.isPending}>
//                 {loginMut.isPending ? "Authenticating..." : "ACCESS SYSTEM"}
//               </Button>
//             </form>
//           </Form>

//           <div className="mt-4 p-3 bg-muted/40 rounded border border-border text-xs text-muted-foreground font-mono">
//             <p>Demo: admin / admin123</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }