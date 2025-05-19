import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <ShieldAlert className="h-12 w-12 text-destructive" />
        </div>
        <CardTitle className="text-2xl">Acesso Negado</CardTitle>
        <CardDescription>
          Você não tem permissão para acessar esta página
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <p>
            Seu nível de acesso atual ({user?.role}) não permite visualizar este
            conteúdo.
          </p>
          <p className="text-muted-foreground">
            Entre em contato com um administrador se você precisar de acesso a
            esta funcionalidade.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={() => navigate("/")}>Voltar para Home</Button>
      </CardFooter>
    </Card>
  );
};

export default UnauthorizedPage;
