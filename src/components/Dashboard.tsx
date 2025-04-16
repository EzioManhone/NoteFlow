<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
  <TabsList className="flex flex-wrap gap-2 mb-4 bg-transparent">
    
    {/* Botão fixo 'Dashboard' */}
    <TabsTrigger
      value="dashboard"
      className="data-[state=active]:bg-accent data-[state=active]:text-primary"
    >
      <div className="flex items-center gap-2">
        {/* Ícone opcional aqui se quiser — por exemplo, uma Home ou Grid */}
        <span>Dashboard</span>
      </div>
    </TabsTrigger>

    {/* Botões dinâmicos (widgets) */}
    {visibleWidgets.map((widget) => (
      <TabsTrigger
        key={widget.id}
        value={widget.id}
        className="data-[state=active]:bg-accent data-[state=active]:text-primary"
      >
        <div className="flex items-center gap-2">
          {widget.icon}
          {widget.title}
        </div>
      </TabsTrigger>
    ))}
  </TabsList>

  {/* Conteúdo do botão fixo 'Dashboard' */}
  <TabsContent value="dashboard">
    <DashboardWidget title="Dashboard">
      <p>Bem-vindo ao seu painel personalizado! Escolha uma aba acima para começar a explorar seus dados.</p>
    </DashboardWidget>
  </TabsContent>

  {/* Conteúdo dos widgets dinâmicos */}
  {visibleWidgets.map((widget) => (
    <TabsContent key={widget.id} value={widget.id}>
      <DashboardWidget title={widget.title} icon={widget.icon}>
        {renderWidgetContent(widget.type)}
      </DashboardWidget>
    </TabsContent>
  ))}
</Tabs>
