export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Termos de Uso</h1>
      
      <div className="prose prose-lg">
        <p>
          Ao acessar e usar o Efeito Bola de Neve ("site", "nós", "nosso"), você concorda com estes termos de uso. 
          Se você não concordar com qualquer parte destes termos, não use nosso site.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Isenção de Responsabilidade sobre Investimentos</h2>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
          <p className="font-medium">
            Esta ferramenta é fornecida apenas para fins informativos e não constitui recomendação de investimento. 
            A pontuação e análises baseiam-se em parâmetros de mercado, mas não garantem resultados futuros.
          </p>
          <p className="mt-2">
            Todas as informações apresentadas são meramente indicativas e não devem ser interpretadas como aconselhamento 
            financeiro, recomendação de compra ou venda de ativos. O investidor é responsável por suas próprias 
            decisões de investimento.
          </p>
        </div>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Uso do Site</h2>
        <p>
          Ao usar este site, você concorda em:
        </p>
        <ul className="list-disc pl-6 mt-2">
          <li>Não usar o site de maneira ilegal ou não autorizada</li>
          <li>Não tentar acessar áreas restritas do site</li>
          <li>Não interferir com a segurança do site</li>
          <li>Não distribuir vírus ou outros códigos maliciosos</li>
          <li>Não coletar dados dos usuários sem autorização</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Precisão das Informações</h2>
        <p>
          Nos esforçamos para manter as informações no site precisas e atualizadas, mas não garantimos sua 
          exatidão, integridade ou atualidade. As informações são fornecidas "como estão" e podem conter erros.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Propriedade Intelectual</h2>
        <p>
          Todo o conteúdo do site, incluindo textos, gráficos, logos, imagens e software, é protegido por direitos 
          autorais e outras leis de propriedade intelectual.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Links para Outros Sites</h2>
        <p>
          Nosso site pode conter links para sites de terceiros. Não somos responsáveis pelo conteúdo ou práticas 
          de privacidade desses sites.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Limitação de Responsabilidade</h2>
        <p>
          Em nenhuma circunstância seremos responsáveis por quaisquer danos diretos, indiretos, especiais ou 
          consequentes resultantes do uso ou incapacidade de usar este site.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Modificações</h2>
        <p>
          Reservamos o direito de modificar estes termos a qualquer momento. As modificações entram em vigor 
          imediatamente após sua publicação no site.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Lei Aplicável</h2>
        <p>
          Estes termos são regidos pelas leis do Brasil. Qualquer disputa relacionada a estes termos será 
          submetida à jurisdição exclusiva dos tribunais brasileiros.
        </p>

        <p className="mt-8 text-sm text-gray-600">
          Última atualização: 13 de dezembro de 2023
        </p>
      </div>
    </div>
  )
}
