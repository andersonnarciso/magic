export default function GoogleAdsensePolicies() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Políticas do Google AdSense</h1>
      
      <div className="prose prose-lg">
        <p>
          Este site utiliza o Google AdSense para exibir anúncios. O Google AdSense é um serviço de publicidade 
          fornecido pelo Google que permite a publicação de anúncios em nosso site.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Como funciona</h2>
        <p>
          O Google AdSense usa cookies e tecnologias similares para melhorar a experiência de publicidade e fornecer 
          anúncios mais relevantes para nossos usuários. Estes cookies coletam informações sobre suas visitas ao 
          nosso site e outros sites para fornecer publicidade mais direcionada.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Informações coletadas</h2>
        <p>
          O Google AdSense pode coletar as seguintes informações:
        </p>
        <ul className="list-disc pl-6 mt-2">
          <li>Endereço IP</li>
          <li>Tipo de navegador</li>
          <li>Sistema operacional</li>
          <li>Páginas visitadas</li>
          <li>Tempo gasto no site</li>
          <li>Sites visitados anteriormente</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Controle de anúncios</h2>
        <p>
          Você pode personalizar como o Google anuncia para você usando o Gerenciador de preferências de anúncios do Google. 
          Além disso, você pode desativar o uso de cookies para publicidade personalizada visitando as configurações de anúncios do Google.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Links úteis</h2>
        <ul className="list-disc pl-6 mt-2">
          <li>
            <a 
              href="https://policies.google.com/technologies/ads" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Como o Google usa cookies na publicidade
            </a>
          </li>
          <li>
            <a 
              href="https://adssettings.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Configurações de anúncios do Google
            </a>
          </li>
        </ul>

        <p className="mt-8 text-sm text-gray-600">
          Última atualização: 13 de dezembro de 2023
        </p>
      </div>
    </div>
  )
}
