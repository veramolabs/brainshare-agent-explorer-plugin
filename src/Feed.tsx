import React, { useState } from 'react'
import { formatRelative } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { useVeramo } from '@veramo-community/veramo-react'
import { PageContainer, ProList } from '@ant-design/pro-components'
import { IDataStoreORM, UniqueVerifiableCredential } from '@veramo/core'
import { EllipsisOutlined, PlusOutlined } from '@ant-design/icons'
import { IdentifierProfile, getIssuerDID, CredentialActionsDropdown, VerifiableCredentialComponent } from '@veramo-community/agent-explorer-plugin'
import { App, Button, Drawer, List } from 'antd'
import { PostForm } from './PostForm.js'
import { MarkDown } from './MarkDown'

export const Feed = () => {
  const { notification } = App.useApp()
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pageSize, setPageSize] = React.useState(10)
  const [page, setPage] = React.useState(1)
  const navigate = useNavigate()
  const { agent } = useVeramo<IDataStoreORM>()


  const { data: credentialsCount } = useQuery(
    ['credentialsCount', { agentId: agent?.context.name }],
    () =>
      agent?.dataStoreORMGetVerifiableCredentialsCount({
        where: [{ column: 'type', value: ['VerifiableCredential,BrainSharePost'] }],
      }),
  )

  const { data: credentials, isLoading, refetch } = useQuery(
    ['brainshare-posts', { agentId: agent?.context.name }],
    () =>
      agent?.dataStoreORMGetVerifiableCredentials({
        where: [{ column: 'type', value: ['VerifiableCredential,BrainSharePost'] }],
        order: [{ column: 'issuanceDate', direction: 'DESC' }],
      }),
  )

  const handleNewPost = async (hash: string) => {
    notification.success({
      message: 'Post created'
    })
    setDrawerOpen(false)
    await refetch()
    navigate('/brainshare/' + hash)
  }


  return (
    <PageContainer
    extra={[
      <Button
        key={'add'}
        icon={<PlusOutlined />}
        type="primary"
        title="Compose new post"
        onClick={() => setDrawerOpen(true)}
      >Compose</Button>,
    ]}
    >

      <List
        itemLayout="vertical"
        size="large"
        pagination={{
          position: 'both',
          pageSize: pageSize,
          current: page,
          total: credentialsCount,
          showSizeChanger: true,
          onChange(page, pageSize) {
            setPage(page)
            setPageSize(pageSize)
          },
        }}
        dataSource={credentials}
        renderItem={(item) => (
          <div style={{marginTop: '20px'}}>
          <VerifiableCredentialComponent credential={item} />
          </div>
        )}
      />

      <Drawer 
        title="Compose new post"
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen} 
        width={800}
        destroyOnClose={true}
      >
        <PostForm onOk={handleNewPost}/>
      </Drawer>
    </PageContainer>
  )
}
