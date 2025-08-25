'use client'

import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  Users, 
  BarChart3, 
  Calendar, 
  MapPin, 
  Zap, 
  Shield, 
  TrendingUp,
  CheckCircle,
  Star,
  Heart,
  Leaf,
  Cow
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function HomePage() {
  const router = useRouter()

  const features = [
    {
      icon: Users,
      title: "Gestão de Rebanho",
      description: "Controle completo do seu rebanho com informações detalhadas de cada animal",
      color: "bg-emerald-500"
    },
    {
      icon: BarChart3,
      title: "Relatórios Inteligentes",
      description: "Análises avançadas e relatórios para tomada de decisões estratégicas",
      color: "bg-blue-500"
    },
    {
      icon: Calendar,
      title: "Calendário de Manejos",
      description: "Organize e acompanhe todos os manejos e eventos importantes",
      color: "bg-purple-500"
    },
    {
      icon: MapPin,
      title: "Gestão de Propriedades",
      description: "Administre múltiplas propriedades de forma centralizada",
      color: "bg-orange-500"
    },
    {
      icon: Zap,
      title: "Sistema Rápido",
      description: "Interface moderna e responsiva para máxima produtividade",
      color: "bg-yellow-500"
    },
    {
      icon: Shield,
      title: "Dados Seguros",
      description: "Suas informações protegidas com a mais alta segurança",
      color: "bg-red-500"
    }
  ]

  const stats = [
    { label: "Propriedades Gerenciadas", value: "500+", icon: MapPin },
    { label: "Animais Cadastrados", value: "50K+", icon: Cow },
    { label: "Usuários Ativos", value: "2K+", icon: Users },
    { label: "Taxa de Satisfação", value: "98%", icon: Star }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-emerald-600/10" />
        <div className="relative container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                  <Leaf className="w-3 h-3 mr-1" />
                  Tecnologia no Campo
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Gerencie seu 
                  <span className="text-green-600"> Agronegócio </span>
                  com Inteligência
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  O AgroNexus é a solução completa para gestão pecuária moderna. 
                  Controle seu rebanho, organize manejos e tome decisões baseadas em dados.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                  onClick={() => router.push('/dashboard')}
                >
                  Acessar Sistema
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-3"
                  onClick={() => router.push('/login')}
                >
                  Fazer Login
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-600">Gratuito por 30 dias</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-600">Suporte especializado</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 border">
                <div className="flex justify-center mb-6">
                  <Image
                    src="/agro_nexus.png"
                    alt="AgroNexus - Sistema de Gestão Pecuária"
                    width={300}
                    height={120}
                    className="h-auto w-auto max-w-full"
                    priority
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-green-800 font-medium">Rebanho Total</span>
                    <span className="text-2xl font-bold text-green-600">1,247</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-800 font-medium">Propriedades</span>
                    <span className="text-2xl font-bold text-blue-600">3</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-purple-800 font-medium">Manejos Hoje</span>
                    <span className="text-2xl font-bold text-purple-600">12</span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" />
              <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <stat.icon className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa para gerir seu agronegócio
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Uma plataforma completa com todas as ferramentas necessárias para 
              modernizar e otimizar a gestão da sua propriedade rural.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold text-white mb-4">
              Pronto para revolucionar sua gestão pecuária?
            </h2>
            <p className="text-xl text-green-100 leading-relaxed">
              Junte-se a milhares de produtores que já transformaram 
              seus negócios com o AgroNexus. Comece hoje mesmo!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3"
                onClick={() => router.push('/dashboard')}
              >
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white hover:text-green-600 px-8 py-3"
                onClick={() => router.push('/login')}
              >
                <Heart className="mr-2 h-5 w-5" />
                Entrar na Plataforma
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <Image
                src="/logo.png"
                alt="AgroNexus Logo"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <div>
                <h3 className="text-white font-semibold text-lg">AgroNexus</h3>
                <p className="text-gray-400 text-sm">Gestão Pecuária Inteligente</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-gray-400">Crescimento Sustentável</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 AgroNexus. Todos os direitos reservados. 
              Desenvolvido com <Heart className="h-4 w-4 text-red-500 inline mx-1" /> para o agronegócio brasileiro.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
